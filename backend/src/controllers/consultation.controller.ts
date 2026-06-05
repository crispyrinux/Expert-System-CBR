import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { cbrService } from "../services/cbr.service.js";
import { addSymptomsSchema } from "../validators/consultation.validator.js";

const prisma = new PrismaClient();

// Generator kode robust yang mengambil angka terakhir dari database
async function generateConsultationCode() {
  const lastRecord = await prisma.consultation.findFirst({
    orderBy: { code: "desc" },
    select: { code: true },
  });

  let nextId = 1;
  if (lastRecord) {
    const lastNumber = parseInt(lastRecord.code.replace("C-", ""));
    if (!isNaN(lastNumber)) {
      nextId = lastNumber + 1;
    }
  }
  return `C-${nextId.toString().padStart(4, "0")}`;
}

export const consultationController = {
  // POST /consultations
  async createConsultation(req: Request, res: Response) {
    try {
      const code = await generateConsultationCode();
      const consultation = await prisma.consultation.create({
        data: {
          code,
          status: "DRAFT",
        },
      });

      res.status(201).json({
        consultationId: consultation.id,
        status: consultation.status,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /consultations/:id/symptoms
  async addSymptoms(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const parsed = addSymptomsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.format() });
        return;
      }

      const { symptoms: symptomIds } = parsed.data;

      const consultation = await prisma.consultation.findUnique({
        where: { id },
      });

      if (!consultation) {
        res.status(404).json({ message: "Consultation not found" });
        return;
      }

      if (consultation.status === "COMPLETED") {
        res.status(400).json({ message: "Consultation is already completed" });
        return;
      }

      const existingSymptoms = await prisma.symptom.findMany({
        where: {
          id: { in: symptomIds },
        },
      });

      if (existingSymptoms.length !== symptomIds.length) {
        res.status(400).json({ message: "One or more symptoms are invalid" });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.consultationSymptom.deleteMany({
          where: { consultationId: id },
        });

        await tx.consultationSymptom.createMany({
          data: symptomIds.map((symptomId) => ({
            consultationId: id,
            symptomId,
          })),
        });
      });

      res.status(200).json({ message: "Symptoms saved successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async diagnose(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const consultation = await prisma.consultation.findUnique({
        where: { id },
        include: {
          consultationSymptoms: true,
        },
      });

      if (!consultation) {
        res.status(404).json({ message: "Consultation not found" });
        return;
      }

      if (consultation.consultationSymptoms.length === 0) {
        res.status(400).json({ message: "No symptoms selected for this consultation" });
        return;
      }

      const selectedSymptomIds = consultation.consultationSymptoms.map((cs) => cs.symptomId);

      const result = await cbrService.findBestDiagnosis(selectedSymptomIds);

      await prisma.$transaction(async (tx) => {
        await tx.diagnosisResult.deleteMany({
          where: { consultationId: id },
        });

        if (result.disease) {
           await tx.diagnosisResult.create({
            data: {
              consultationId: id,
              diseaseId: result.disease.id,
              rank: 1,
              similarity: result.similarity,
              isPrimary: true,
            },
          });
        }

        await tx.consultation.update({
          where: { id },
          data: { status: "COMPLETED" },
        });
      });

      res.status(200).json({
        consultationId: id,
        status: "COMPLETED",
        diagnosis: {
          disease: result.disease,
          case: result.case,
          similarity: result.similarity,
          symptomDetails: result.symptomDetails, // <--- Ini yang diteruskan ke UI (Frontend)
          status: result.status,
          ambiguous: result.ambiguous,
        },
        topMatches: result.topMatches,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /consultations/:id/confirm
  async confirmConsultation(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // 1. Cek trace relasi formal untuk mencegah duplikasi (Duplicate Protection)
      const existingCandidate = await prisma.candidateCase.findUnique({
        where: { consultationId: id }
      });

      if (existingCandidate) {
        res.status(409).json({ message: "Consultation already confirmed" });
        return;
      }

      const consultation = await prisma.consultation.findUnique({
        where: { id },
        include: {
          consultationSymptoms: {
            include: {
              symptom: {
                include: {
                  symptomWeight: true,
                },
              },
            },
          },
          diagnosisResults: {
            where: { rank: 1 },
            include: { disease: true },
          },
        },
      });

      if (!consultation) {
        res.status(404).json({ message: "Consultation not found" });
        return;
      }

      if (consultation.status !== "COMPLETED") {
        res.status(400).json({ message: "Consultation must be COMPLETED before confirmation" });
        return;
      }

      const primaryDiagnosis = consultation.diagnosisResults[0];
      if (!primaryDiagnosis) {
        res.status(400).json({ message: "No diagnosis found for this consultation" });
        return;
      }

      // Robust Candidate Code Generator (CC-xxxx)
      const lastRecord = await prisma.candidateCase.findFirst({
        orderBy: { code: "desc" },
        select: { code: true }
      });
      let nextId = 1;
      if (lastRecord) {
        const lastNumber = parseInt(lastRecord.code.replace("CC-", ""));
        if (!isNaN(lastNumber)) nextId = lastNumber + 1;
      }
      const candidateCode = `CC-${nextId.toString().padStart(4, "0")}`;

      const candidateCase = await prisma.candidateCase.create({
        data: {
          code: candidateCode,
          consultationId: id, // Menautkan relasi formal
          diseaseId: primaryDiagnosis.diseaseId,
          title: `Kasus Baru: ${primaryDiagnosis.disease.name}`,
          description: `Berasal dari konsultasi ${consultation.code}`,
          status: "UNDER_REVIEW",
          candidateCaseSymptoms: {
            create: consultation.consultationSymptoms.map((cs) => ({
              symptomId: cs.symptomId,
              weight: cs.symptom.symptomWeight?.weight ?? 1,
            })),
          },
        },
      });

      res.status(201).json({
        message: "Diagnosis confirmed and saved as candidate case",
        candidateId: candidateCase.id,
        status: candidateCase.status,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

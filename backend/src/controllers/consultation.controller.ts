import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { cbrService } from "../services/cbr.service.js";
import { addSymptomsSchema } from "../validators/consultation.validator.js";

const prisma = new PrismaClient();

// Helper untuk men-generate format kode unik seperti C-0001
async function generateConsultationCode() {
  const count = await prisma.consultation.count();
  const nextId = count + 1;
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
  async addSymptoms(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const parsed = addSymptomsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.format() });
        return;
      }

      const { symptoms: symptomIds } = parsed.data;

      // Cek ketersediaan consultation
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

      // Cek ketersediaan gejala di database
      const existingSymptoms = await prisma.symptom.findMany({
        where: {
          id: { in: symptomIds },
        },
      });

      if (existingSymptoms.length !== symptomIds.length) {
        res.status(400).json({ message: "One or more symptoms are invalid" });
        return;
      }

      // Reset gejala untuk konsultasi ini jika sudah ada, kemudian insert baru
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

  // GET /consultations/:id/diagnose
  async diagnose(req: Request, res: Response): Promise<void> {
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

      // Jalankan CBR Engine
      const result = await cbrService.findBestDiagnosis(selectedSymptomIds);

      // Simpan hasil dan update status di transaction
      await prisma.$transaction(async (tx) => {
        // Hapus hasil lama jika ada (idempotency support)
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
          similarity: result.similarity,
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
};

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Robust Case Code Generator (Kxx)
async function generateCaseCode() {
  const lastRecord = await prisma.caseBase.findFirst({
    orderBy: { code: "desc" },
    select: { code: true }
  });
  
  let nextId = 1;
  if (lastRecord) {
    const lastNumber = parseInt(lastRecord.code.replace("K", ""));
    if (!isNaN(lastNumber)) nextId = lastNumber + 1;
  }
  
  return `K${nextId.toString().padStart(2, "0")}`;
}

export const adminController = {
  // GET /admin/candidates
  async getCandidates(req: Request, res: Response) {
    try {
      const candidates = await prisma.candidateCase.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          disease: {
            select: { name: true, code: true },
          },
          _count: {
            select: { candidateCaseSymptoms: true },
          },
        },
      });

      const formatted = candidates.map((c) => ({
        id: c.id,
        code: c.code,
        disease: `${c.disease.code} - ${c.disease.name}`,
        symptomCount: c._count.candidateCaseSymptoms,
        status: c.status,
        createdAt: c.createdAt,
      }));

      res.status(200).json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /admin/candidates/:id
  async getCandidateDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const candidate = await prisma.candidateCase.findUnique({
        where: { id },
        include: {
          disease: true,
          consultation: {
            select: { code: true, createdAt: true }
          },
          candidateCaseSymptoms: {
            include: {
              symptom: true,
            },
          },
        },
      });

      if (!candidate) {
        res.status(404).json({ message: "Candidate case not found" });
        return;
      }

      res.status(200).json(candidate);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /admin/candidates/:id/approve
  async approveCandidate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const candidate = await prisma.candidateCase.findUnique({
        where: { id },
        include: {
          candidateCaseSymptoms: true,
        },
      });

      if (!candidate) {
        res.status(404).json({ message: "Candidate case not found" });
        return;
      }

      // Validasi Strict Status Transition
      if (candidate.status !== "UNDER_REVIEW") {
        res.status(400).json({ 
          message: `Cannot approve candidate with status ${candidate.status}. Only UNDER_REVIEW can be approved.` 
        });
        return;
      }

      const caseCode = await generateCaseCode();

      const newCase = await prisma.$transaction(async (tx) => {
        // 1. Create CaseBase
        const createdCase = await tx.caseBase.create({
          data: {
            code: caseCode,
            diseaseId: candidate.diseaseId,
            title: candidate.title,
            description: candidate.description,
            approvedFromCandidateCaseId: candidate.id,
            caseSymptoms: {
              create: candidate.candidateCaseSymptoms.map((cs) => ({
                symptomId: cs.symptomId,
                weight: cs.weight,
              })),
            },
          },
        });

        // 2. Update Candidate Status
        await tx.candidateCase.update({
          where: { id },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });

        return createdCase;
      });

      res.status(200).json({
        message: "Candidate case approved and promoted to CaseBase",
        caseId: newCase.id,
        code: newCase.code,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /admin/candidates/:id/reject
  async rejectCandidate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const candidate = await prisma.candidateCase.findUnique({
        where: { id },
      });

      if (!candidate) {
        res.status(404).json({ message: "Candidate case not found" });
        return;
      }

      // Validasi Strict Status Transition
      if (candidate.status !== "UNDER_REVIEW") {
        res.status(400).json({ 
          message: `Cannot reject candidate with status ${candidate.status}. Only UNDER_REVIEW can be rejected.` 
        });
        return;
      }

      await prisma.candidateCase.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      res.status(200).json({ message: "Candidate case rejected" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

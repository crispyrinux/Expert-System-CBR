import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/symptoms", async (req, res) => {
  try {
    const symptoms = await prisma.symptom.findMany({
      orderBy: { code: "asc" }
    });
    res.json(symptoms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

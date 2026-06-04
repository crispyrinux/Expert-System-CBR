import { Router } from "express";
import { consultationController } from "../controllers/consultation.controller.js";

const router = Router();

router.post("/", consultationController.createConsultation);
router.post("/:id/symptoms", consultationController.addSymptoms);
router.get("/:id/diagnose", consultationController.diagnose);
router.post("/:id/confirm", consultationController.confirmConsultation);

export default router;

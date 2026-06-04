import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";

const router = Router();

router.get("/candidates", adminController.getCandidates);
router.get("/candidates/:id", adminController.getCandidateDetail);
router.post("/candidates/:id/approve", adminController.approveCandidate);
router.post("/candidates/:id/reject", adminController.rejectCandidate);

export default router;

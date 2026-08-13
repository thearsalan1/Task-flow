import { Router } from "express";
import { getBoard, getBoardStats } from "../controllers/board.controller.js";

const router = Router();

router.get("/:id", getBoard);
router.get("/:id/stats", getBoardStats);

export default router;

import { Router } from "express";
import { chatWithBot } from "../controllers/aimodel.controller.js";

const router = Router();

router.route("/").post(chatWithBot)

export default router
import { Router } from "express";
import { chatWithBot, diagnose, } from "../controllers/aimodel.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").post(chatWithBot)

router.post("/diagnose", upload.single("audio"), diagnose);

export default router
import { Router } from "express";
import { chatWithBot, diagnose } from "../controllers/aimodel.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js"; // ✅ Protect routes

const router = Router();

router.route("/").post(chatWithBot);
router.post("/diagnose", verifyUserJWT, upload.single("audio"), diagnose); // ✅ Ensure user is logged in

export default router;
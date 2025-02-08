import { Router } from "express";
import { getUserReports } from "../controllers/report.controller.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyUserJWT, getUserReports); // ✅ Fetch reports only for logged-in users

export default router;

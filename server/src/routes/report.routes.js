import { Router } from "express";
import { getUserReports, getDashboardStats } from "../controllers/report.controller.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyUserJWT, getUserReports);
router.get("/dashboard-stats", verifyUserJWT, getDashboardStats);

export default router;
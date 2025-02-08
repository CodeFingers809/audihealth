import express from "express";
import { trackExercise, getUserExercise } from "../controllers/exercise.controller.js";
// import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/track", trackExercise);
router.get("/progress/:userId", getUserExercise);

export default router;

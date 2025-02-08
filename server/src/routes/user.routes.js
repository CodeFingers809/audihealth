import { Router } from "express";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser
} from "../controllers/user.controller.js";

import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUserJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken); // Fixed route path

export default router;
import { Router } from "express";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword
} from "../controllers/user.controller.js";

import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUserJWT, logoutUser);
router.post("/user/refresh-token", refreshAccessToken);

// Password management
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Profile management
router.put("/update-profile", verifyUserJWT, updateProfile);
router.put("/change-password", verifyUserJWT, changePassword);

export default router;
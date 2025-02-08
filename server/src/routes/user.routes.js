import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, getCurrentUser } from "../controllers/user.controller.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    registerUser
)

router.route("/login").post(
    loginUser
)

router.route("/logout").post(
    verifyUserJWT,
    logoutUser
)

router.route("/user/refresh-token").post(
    refreshAccessToken
)

router.route("/user").get(
    verifyUserJWT,
    getCurrentUser
)

export default router;
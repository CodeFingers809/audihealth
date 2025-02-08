import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
    }
};

// Register User
export const registerUser = asyncHandler(async (req, res) => {
    const { email, username, fullName, password } = req.body;

    if ([email, username, fullName, password].some((field) => !field?.trim())) {
        return res.status(400).json({ success: false, message: "All fields are necessary" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        return res.status(409).json({ success: false, message: "User with same email or username exists" });
    }

    const user = await User.create({ fullName, email, username: username.toLowerCase(), password });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        return res.status(500).json({ success: false, message: "User was created but not found when queried" });
    }

    return res.status(201).json({ data: createdUser, message: "User created successfully", success: true });
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        return res.status(400).json({ success: false, message: "Username or Email is required" });
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user || !(await user.isPasswordCorrect(password))) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .json({ success: true, user, accessToken, refreshToken, message: "User logged in successfully" });
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined });

    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json({ success: true, message: "User logged out successfully" });
});

// Refresh Access Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user || incomingRefreshToken !== user?.refreshToken) {
        return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res.status(200).cookie("accessToken", accessToken, { httpOnly: true, secure: true }).cookie("refreshToken", refreshToken, { httpOnly: true, secure: true }).json({ success: true, accessToken, refreshToken, message: "Access Token refreshed" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Here, send an email with `resetToken`
    return res.status(200).json({
        success: true,
        message: "Password reset token generated. Send this token via email",
        resetToken
    });
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
});

// Update Profile
export const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, username } = req.body;

    if (!fullName && !username) {
        return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { fullName, username: username.toLowerCase() },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res.status(200).json({ success: true, user: updatedUser, message: "Profile updated successfully" });
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Both old and new passwords are required" });
    }

    const user = await User.findById(req.user._id);

    if (!(await user.isPasswordCorrect(oldPassword))) {
        return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
});
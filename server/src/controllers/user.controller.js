import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error("Error while generating tokens");
    }
};

export const registerUser = asyncHandler(async (req, res) => {
    const { email, username, fullName, password } = req.body;

    if ([email, username, fullName, password].some((field) => !field?.trim())) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "User with email or username already exists"
        });
    }

    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while registering the user"
        });
    }

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: createdUser
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        return res.status(400).json({
            success: false,
            message: "Username or email is required"
        });
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user || !(await user.isPasswordCorrect(password))) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        .json({
            success: true,
            user: loggedInUser,
            accessToken,
            message: "User logged in successfully"
        });
});


export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        .clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        .json({
            success: true,
            message: "User logged out successfully"
        });
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized request - No refresh token"
        });
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user || incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            })
            .json({
                success: true,
                accessToken,
                user,
                message: "Access token refreshed"
            });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
        });
    }
});
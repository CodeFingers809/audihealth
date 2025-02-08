import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler( async (req, res) => {
    const {email, username, fullName, password} = req.body; 

    if(
        [email, username, fullName, password].some((field) => field?.trim() === "")
    ) {
        console.log("All fields are necessary :: RegisterUser");
        return res.status(400).json({
            success: false,
            message: "All fields are necessary"
        })
        
    }

    const existingUser = await User.findOne({
        $or : [{email}, {username}]
    })

    if(existingUser) {
        console.log("User already exists :: RegisterUser");
        deleteTempFile(req?.file?.path);
        return res.status(409).json({
            success: false,
            message: "User with same email or username exits"
        })
    }
    
    const avatarLocalPath = req?.file?.path || "";
    let avatar = ""

    if(avatarLocalPath) {
        try {
            const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
            if (!uploadedAvatar) {
                return res.status(401).json({
                    success: false,
                    message: "Avatar upload failed"
                })
            }
            avatar = uploadedAvatar.url;
        } catch (error) {
            console.log("Avatar file not uploaded on cloudinary :: RegisterUser");
            
            if (avatarLocalPath) {
                deleteTempFile(req.file.path);
            }
                
            return res.status(400).json({
                success: false,
                message: "Issue while uploading avatar image",
            });
        }
    }

    const user = await User.create({
        fullName,
        avatar,
        email,
        username: username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        console.log("User not found :: RegisterUser");
        return res.status(500).json({
            success: false,
            message: "The user was created but not found when queried"
        })
    }

    return res.status(201).json({
        data: createdUser,
        message: "User created successfully",
        success: true
    })
    
})

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        console.log(error);
    }
}

export const loginUser = asyncHandler( async (req, res) => {
    const {email, username, password} = req.body;

    if (!username && !email) {
        return res.status(400).json({
            success: false,
            message: "Username or Email is required"
        })
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if(!user) {
        return res.status(400).json({
            success: false,
            message: "User does not exist"
        })
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid User Credentials"
        })
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true, //server modifiable cookies
        secure: true
    }

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                user: loggedInUser,
                accessToken,
                refreshToken,
                message: "User logged in successfully"
            })
})

export const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true, //server modifiable cookies
        secure: true
    }

    return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "User logged out successfully"
            })
})

export const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!incomingRefreshToken) {
        res.status().json({
            success: false,
            message: "Unauthorized request"
        })
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    if(!user) {
        res.status(401).json({
            success: false,
            message: "Invalid Refresh Token"
        })
    }

    if(incomingRefreshToken !== user?.refreshToken) {
        res.status(401).json({
            success: false,
            message: "Referesh Token is expired or used"
        })
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                accessToken,
                refreshToken,
                message: "Access Token refreshed"
            })
})

export const getCurrentUser = asyncHandler( async (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user,
        message: "Current User fetched successfully"
    })
})
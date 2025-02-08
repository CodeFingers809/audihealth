import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyUserJWT = asyncHandler( async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    if(!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized request"
        })
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if(!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid Access Token"
        })
    }

    req.user = user;

    next();
})
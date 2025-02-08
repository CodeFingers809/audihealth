import { asyncHandler } from "../utils/asyncHandler.js";
import { aiRoute } from "../constants.js";
import axios from 'axios'

export const chatWithBot = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        console.log("No message received :: chatWithBot");
        return res.status(400).json({
            success: false,
            message: "No message received"
        });
    }

    try {
        const response = await axios.post(`${aiRoute}/api/chat`, { message });

        if (!response?.data) {
            return res.status(400).json({
                success: false,
                message: "Error with AI :: chatWithBot"
            });
        }

        // Extract the correct key ("response" instead of "message")
        const botMessage = response.data.response || "No response returned";

        res.status(200).json({
            success: true,
            message: botMessage
        });

    } catch (error) {
        console.error("Error in chatWithBot:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});
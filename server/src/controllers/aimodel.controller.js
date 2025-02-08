import { asyncHandler } from "../utils/asyncHandler.js";
import { aiRoute } from "../constants.js";
import axios from 'axios'
import fs from "fs";
import path from "path";
import FormData from "form-data";

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

export const diagnose = asyncHandler( async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No audio file provided" });
      }
    
      const filePath = path.join("./uploads", req.file.filename); // ✅ Ensure correct path
    
      try {
        // ✅ Read the file and send it to Flask
        const formData = new FormData();
        formData.append("audio", fs.createReadStream(filePath)); // ✅ Ensure file exists
    
        const flaskResponse = await axios.post("http://127.0.0.1:8080/api/process_audio", formData, {
          headers: formData.getHeaders(),
        });
    
        // ✅ Delete the file after sending it to Flask
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
    
        // ✅ Send Flask's response back to frontend
        res.json(flaskResponse.data);
      } catch (error) {
        console.error("Error forwarding audio to Flask:", error.message);
    
        // Cleanup: Delete file if request fails
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
    
        res.status(500).json({ success: false, message: "Internal server error" });
      }
})
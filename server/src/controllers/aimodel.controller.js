import { asyncHandler } from "../utils/asyncHandler.js";
import { Report } from "../models/report.model.js";
import moment from 'moment-timezone'
import axios from 'axios';
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { aiRoute } from "../constants.js";

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

export const diagnose = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No audio file provided" });
    }

    const filePath = path.join("./uploads", req.file.filename);

    try {
        const formData = new FormData();
        formData.append("audio", fs.createReadStream(filePath));

        const flaskResponse = await axios.post("http://127.0.0.1:8080/api/process_audio", formData, {
            headers: formData.getHeaders(),
        });

        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        if (!flaskResponse.data) {
            return res.status(500).json({ success: false, message: "No response from AI model" });
        }

        const {
            "Acoustic Features": acousticFeatures,
            "Confidence Scores": confidenceScores,
            "Findings": findings,
            "PDF_URL": pdfUrl,
            "Prediction": prediction
        } = flaskResponse.data;

        // ✅ Ensure analysis date has correct time in IST
        const analysisDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

        const report = await Report.create({
            userId: req.user._id,
            acousticFeatures,
            analysisDate, // ✅ Save IST timestamp
            confidenceScores,
            findings,
            pdfUrl,
            prediction
        });

        res.json({
            success: true,
            message: "Report generated successfully",
            report
        });

    } catch (error) {
        console.error("Error processing diagnosis:", error.message);

        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
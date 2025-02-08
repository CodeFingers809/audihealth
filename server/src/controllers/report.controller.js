import { asyncHandler } from "../utils/asyncHandler.js";
import { Report } from "../models/report.model.js";

export const getUserReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
        success: true,
        count: reports.length,
        reports
    });
});

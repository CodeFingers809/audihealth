import { asyncHandler } from "../utils/asyncHandler.js";
import { Report } from "../models/report.model.js";
import { Exercise } from "../models/exercise.model.js";
import moment from "moment-timezone";
import mongoose from "mongoose";

export const getUserReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
        success: true,
        count: reports.length,
        reports
    });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get recent reports (last 5)
    const recentReports = await Report.find({ userId })
        .sort({ analysisDate: -1 })
        .limit(5)
        .lean();

    // Latest report details
    const latestReport = recentReports[0] || null;

    // Aggregate average jitter, shimmer, and MFCCs
    const averageMetrics = await Report.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                avgJitter: { $avg: { $ifNull: ["$acousticFeatures.Jitter_Percent", 0] } },
                avgShimmer: { $avg: { $ifNull: ["$acousticFeatures.Shimmer_Percent", 0] } },
                mfccMean: { $avg: { $ifNull: ["$acousticFeatures.MFCC_Mean", []] } },
                mfccStd: { $avg: { $ifNull: ["$acousticFeatures.MFCC_Std", []] } },
            },
        },
    ]);

    // Weekly Data for Line Chart
    const weeklyData = await Report.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $addFields: {
                analysisDateAsDate: { $toDate: "$analysisDate" }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$analysisDateAsDate" } },
                avgJitter: { $avg: { $ifNull: ["$acousticFeatures.Jitter_Percent", 0] } },
                avgShimmer: { $avg: { $ifNull: ["$acousticFeatures.Shimmer_Percent", 0] } },
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Prediction Distribution for Pie Chart
    const predictionDistribution = await Report.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: "$prediction",
                count: { $sum: 1 },
            },
        },
    ]);

    const formattedPredictions = {};
    predictionDistribution.forEach((entry) => {
        formattedPredictions[entry._id] = entry.count;
    });

    // Exercise Progress
    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
    const todayExercises = await Exercise.findOne({ userId, date: today });

    res.json({
        success: true,
        data: {
            recentReports,
            latestReport,
            averages: averageMetrics.length > 0 ? averageMetrics[0] : { avgJitter: 0, avgShimmer: 0, mfccMean: [], mfccStd: [] },
            weeklyData: weeklyData.map((entry) => ({
                date: entry._id,
                jitter: entry.avgJitter,
                shimmer: entry.avgShimmer,
            })),
            predictionDistribution: formattedPredictions,
            exerciseProgress: {
                completed: todayExercises?.completedExercises.length || 0,
                total: 9, // Total exercises available
            },
        },
    });
});

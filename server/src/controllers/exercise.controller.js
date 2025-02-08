import { Exercise } from "../models/exercise.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import moment from 'moment-timezone'

export const trackExercise = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { completedExercises } = req.body;
    const date = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    let exercise = await Exercise.findOne({ userId, date });

    if (exercise) {
        exercise.completedExercises = completedExercises;
        await exercise.save();
    } else {
        exercise = await Exercise.create({ userId, completedExercises, date });
    }

    res.status(200).json({
        success: true,
        message: "Exercise progress updated",
        exercise
    });
});

export const getUserExercise = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    // Get today's progress
    const todayProgress = await Exercise.findOne({ userId, date: today }) || { completedExercises: [] };

    // Get last 7 days for trends
    const pastWeek = await Exercise.find({ userId }).sort({ date: -1 }).limit(7);

    res.status(200).json({
        success: true,
        todayProgress,
        weeklyProgress: pastWeek.length ? pastWeek : [] // Ensure it's always an array
    });
});

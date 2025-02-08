import { Exercise } from "../models/exercise.model.js";

export const trackExercise = async (req, res) => {
    try {
        const { userId, completedExercises, confidenceScores } = req.body;
        const date = new Date().toISOString().split("T")[0];

        const existingEntry = await Exercise.findOne({ userId, date });

        if (existingEntry) {
            existingEntry.completedExercises = completedExercises;
            existingEntry.confidenceScores = confidenceScores;
            await existingEntry.save();
            return res.json({ message: "Exercise updated", exercise: existingEntry });
        }

        const newExercise = new Exercise({ userId, completedExercises, confidenceScores });
        await newExercise.save();
        res.status(201).json({ message: "Exercise logged", exercise: newExercise });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserExercise = async (req, res) => {
    try {
        const { userId } = req.params;
        const exercises = await Exercise.find({ userId }).sort({ date: -1 });
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

import mongoose from "mongoose";
import moment from "moment-timezone";

const exerciseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: String,
        default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD"),
        index: true
    },
    completedExercises: {
        type: [String], // Changed to simple array of exercise IDs
        default: []
    }
}, { timestamps: true });

export const Exercise = mongoose.model("Exercise", exerciseSchema);
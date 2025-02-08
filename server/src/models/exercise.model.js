import mongoose from "mongoose";
import moment from "moment-timezone";

const exerciseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: String, // Storing as String to maintain timezone consistency
        default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD"),
        index: true // Indexing for efficient queries
    },
    completedExercises: {
        breathing: {
            type: [String], // Stores exercise IDs
            default: []
        },
        pitch: {
            type: [String],
            default: []
        },
        articulation: {
            type: [String],
            default: []
        }
    },
    confidenceScores: {
        Healthy: String,
        Laryngitis: String,
        Vocal_Polyp: String
    },
    improvement: {
        type: String, // Describes improvement based on confidenceScores changes
        default: "No data"
    }
}, { timestamps: true });

// Middleware to analyze improvement
exerciseSchema.pre("save", async function (next) {
    if (this.isModified("confidenceScores")) {
        const lastEntry = await this.constructor.findOne({
            userId: this.userId
        }).sort({ date: -1 });

        if (lastEntry && lastEntry.confidenceScores) {
            const prevScores = lastEntry.confidenceScores;
            const currScores = this.confidenceScores;

            if (parseFloat(currScores.Healthy) > parseFloat(prevScores.Healthy)) {
                this.improvement = "Improved";
            } else if (parseFloat(currScores.Laryngitis) > parseFloat(prevScores.Laryngitis) || 
                       parseFloat(currScores.Vocal_Polyp) > parseFloat(prevScores.Vocal_Polyp)) {
                this.improvement = "Deteriorated";
            } else {
                this.improvement = "No significant change";
            }
        } else {
            this.improvement = "First recorded session";
        }
    }
    next();
});

export const Exercise = mongoose.model("Exercise", exerciseSchema);
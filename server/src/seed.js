import mongoose from "mongoose";
import dotenv from "dotenv";
import moment from "moment-timezone";
import { User } from "./models/user.model.js";
import { Report } from "./models/report.model.js";
import { Exercise } from "./models/exercise.model.js";

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI || "your-mongodb-connection-string";

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb+srv://aniketmdinde100:Aniket*99@audihealth.lvbcn.mongodb.net/audihealth?", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log("MongoDB connection error:", err));

const generateRandomNumber = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

// ✅ Sample Users (Check if a user exists or create one)
const seedUsers = async () => {
  let user = await User.findOne({ email: "abcd@abcd.com" });

  if (!user) {
    user = await User.create({
      email: "testuser@example.com",
      username: "testuser",
      fullName: "Test User",
      password: "testpassword", // You may hash it later if needed
    });
  }

  return user._id;
};

// ✅ Generate Sample Reports (7 Days)
const seedReports = async (userId) => {
  await Report.deleteMany({ userId }); // Clear old reports for fresh data

  const sampleReports = [];
  for (let i = 7; i >= 0; i--) {
    sampleReports.push({
      userId,
      acousticFeatures: {
        Jitter_Percent: generateRandomNumber(0.5, 3.0),
        MFCC_Mean: Array.from({ length: 13 }, () => generateRandomNumber(-5, 5)),
        MFCC_Std: Array.from({ length: 13 }, () => generateRandomNumber(0, 2)),
        Shimmer_Percent: generateRandomNumber(0.2, 1.5),
      },
      analysisDate: moment().subtract(i, "days").tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      confidenceScores: {
        Healthy: generateRandomNumber(60, 90),
        Laryngitis: generateRandomNumber(5, 30),
        Vocal_Polyp: generateRandomNumber(0, 20),
      },
      findings: `Test findings for ${moment().subtract(i, "days").format("YYYY-MM-DD")}`,
      pdfUrl: "",
      prediction: ["Healthy", "Laryngitis", "Vocal_Polyp"][Math.floor(Math.random() * 3)],
    });
  }

  await Report.insertMany(sampleReports);
  console.log("✅ Sample Reports Inserted");
};

// ✅ Generate Sample Exercise Data (7 Days)
const seedExercises = async (userId) => {
  await Exercise.deleteMany({ userId }); // Clear old exercises

  const sampleExercises = [];
  for (let i = 7; i >= 0; i--) {
    sampleExercises.push({
      userId,
      date: moment().subtract(i, "days").tz("Asia/Kolkata").format("YYYY-MM-DD"),
      completedExercises: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, index) => `Exercise-${index + 1}`),
    });
  }

  await Exercise.insertMany(sampleExercises);
  console.log("✅ Sample Exercises Inserted");
};

// ✅ Run Seed Process
const seedDatabase = async () => {
  const userId = await seedUsers();
  await seedReports(userId);
  await seedExercises(userId);
  console.log("🎉 Database Seeded Successfully!");
  mongoose.disconnect();
};

seedDatabase();

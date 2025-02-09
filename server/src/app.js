import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Import Routes
import userRouter from "./routes/user.routes.js"
import aiModelRouter from "./routes/aimodel.routes.js"
import reportRouter from "./routes/report.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";

// Routes
app.use("/api/users", userRouter);
app.use("/api/chat", aiModelRouter);
app.use("/api/reports", reportRouter);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/doctors", doctorRoutes);

export { app };
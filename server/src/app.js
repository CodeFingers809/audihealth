import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true
  }));

app.use(express.json());

app.use(express.urlencoded({
    extended: true,
}));

// app.use(express.static("public"))

app.use(cookieParser())

// Import Routes
import userRouter from "./routes/user.routes.js"
import aiModelRouter from "./routes/aimodel.routes.js"
import reportRouter from "./routes/report.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";

// Declare Routes
app.use("/api/users", userRouter); 
app.use("/api/chat", aiModelRouter); 
app.use("/api/reports", reportRouter); 
app.use("/api/exercises", exerciseRoutes);

export {app};
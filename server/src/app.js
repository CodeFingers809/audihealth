import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
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

// Declare Routes
app.use("/api/users", userRouter); 

export {app};
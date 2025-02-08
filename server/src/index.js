import connectDB from "./db/index.js";
import dotenv from 'dotenv'
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR ::", error);;
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`Server is running at PORT: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("MONGODB CONNECTION FAILED ::", error);
    });

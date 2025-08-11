import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import uploadRoutes from "./routes/uploadRoutes.js";
import googleAuthRoutes from './routes/googleRoute.js'
import connectDB from "./db/dbConnect.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:3000", // only allow your React frontend
  credentials: true, // if you plan to send cookies
}));

app.use("/api/v1/upload", uploadRoutes);
app.use("/api", googleAuthRoutes);

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 3001}`);
  connectDB();
});

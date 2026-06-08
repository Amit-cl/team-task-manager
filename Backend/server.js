import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
connectDB();

app.get("/", (req, res) => res.send("Team Task Manager API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => res.status(404).json({ message: "API route not found" }));
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ message: "Something went wrong on server" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

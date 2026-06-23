import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));

// Body parser with size limit (prevent DoS via huge payloads)
app.use(express.json({ limit: "10kb" }));

// NoSQL injection sanitization
app.use(mongoSanitize());

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

connectDB();

// Health check (no auth required)
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/", (req, res) => res.send("Team Task Manager API is running"));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "API route not found" }));

// Global error handler (catches errors from asyncHandler)
app.use((err, req, res, next) => {
  console.error("Server error:", err.message, err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || "Something went wrong on server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

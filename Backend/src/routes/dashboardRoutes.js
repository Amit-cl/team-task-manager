import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const [totalProjects, totalMembers, totalTasks, completedTasks, overdueTasks] = await Promise.all([
        Project.countDocuments(),
        User.countDocuments({ role: "member" }),
        Task.countDocuments(),
        Task.countDocuments({ status: "Completed" }),
        Task.countDocuments({ dueDate: { $lt: today() }, status: { $ne: "Completed" } }),
      ]);
      return res.json({ role: "admin", cards: { totalProjects, totalMembers, totalTasks, completedTasks, overdueTasks } });
    }

    const [myProjects, myTasks, completedTasks, overdueTasks] = await Promise.all([
      Project.countDocuments({ members: req.user._id }),
      Task.countDocuments({ assignedTo: req.user._id }),
      Task.countDocuments({ assignedTo: req.user._id, status: "Completed" }),
      Task.countDocuments({ assignedTo: req.user._id, dueDate: { $lt: today() }, status: { $ne: "Completed" } }),
    ]);
    res.json({ role: "member", cards: { myProjects, myTasks, completedTasks, overdueTasks } });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({ message: "Could not load dashboard" });
  }
});

export default router;

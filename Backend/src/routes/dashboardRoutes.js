import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
const today = () => { const date = new Date(); date.setHours(0, 0, 0, 0); return date; };

router.get("/", protect, async (req, res) => {
  if (req.user.role === "admin") {
    const totalProjects = await Project.countDocuments();
    const totalMembers = await User.countDocuments({ role: "member" });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const overdueTasks = await Task.countDocuments({ dueDate: { $lt: today() }, status: { $ne: "Completed" } });
    return res.json({ role: "admin", cards: { totalProjects, totalMembers, totalTasks, completedTasks, overdueTasks } });
  }
  const myProjects = await Project.countDocuments({ members: req.user._id });
  const myTasks = await Task.countDocuments({ assignedTo: req.user._id });
  const completedTasks = await Task.countDocuments({ assignedTo: req.user._id, status: "Completed" });
  const overdueTasks = await Task.countDocuments({ assignedTo: req.user._id, dueDate: { $lt: today() }, status: { $ne: "Completed" } });
  res.json({ role: "member", cards: { myProjects, myTasks, completedTasks, overdueTasks } });
});
export default router;

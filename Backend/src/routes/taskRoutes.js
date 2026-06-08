import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { isFutureOrToday, isValidObjectId } from "../utils/validators.js";
const router = express.Router();
const validStatuses = ["To Do", "In Progress", "Completed"];
const validPriorities = ["Low", "Medium", "High"];

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
    if (!title || !projectId || !assignedTo || !dueDate) return res.status(400).json({ message: "Title, project, assigned member and due date are required" });
    if (title.trim().length < 3) return res.status(400).json({ message: "Task title must be at least 3 characters" });
    if (!isValidObjectId(mongoose, projectId) || !isValidObjectId(mongoose, assignedTo)) return res.status(400).json({ message: "Invalid project or assigned member id" });
    if (priority && !validPriorities.includes(priority)) return res.status(400).json({ message: "Priority must be Low, Medium or High" });
    if (!isFutureOrToday(dueDate)) return res.status(400).json({ message: "Task due date must be today or a future date" });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const member = await User.findById(assignedTo);
    if (!member || member.role !== "member") return res.status(400).json({ message: "Task can be assigned only to a member" });
    const isProjectMember = project.members.some((id) => id.toString() === assignedTo.toString());
    if (!isProjectMember) return res.status(400).json({ message: "Selected member is not added to this project team" });
    const task = await Task.create({ title: title.trim(), description: description?.trim() || "", project: projectId, assignedTo, createdBy: req.user._id, priority: priority || "Medium", dueDate, status: "To Do" });
    const populated = await Task.findById(task._id).populate("project", "name deadline").populate("assignedTo", "name email role").populate("createdBy", "name email role");
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: "Task creation failed" }); }
});

router.get("/", protect, async (req, res) => {
  const query = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
  const tasks = await Task.find(query).populate("project", "name deadline").populate("assignedTo", "name email role").populate("createdBy", "name email role").sort({ createdAt: -1 });
  res.json(tasks);
});

router.patch("/:id/status", protect, async (req, res) => {
  const { status } = req.body;
  if (!isValidObjectId(mongoose, req.params.id)) return res.status(400).json({ message: "Invalid task id" });
  if (!validStatuses.includes(status)) return res.status(400).json({ message: "Status must be To Do, In Progress or Completed" });
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  const isAssignedMember = task.assignedTo.toString() === req.user._id.toString();
  if (req.user.role !== "admin" && !isAssignedMember) return res.status(403).json({ message: "You can update only your assigned task" });
  task.status = status;
  await task.save();
  const updated = await Task.findById(task._id).populate("project", "name deadline").populate("assignedTo", "name email role").populate("createdBy", "name email role");
  res.json(updated);
});
export default router;

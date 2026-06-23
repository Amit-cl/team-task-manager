import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { isFutureOrToday, isValidObjectId } from "../utils/validators.js";

const router = express.Router();
const validStatuses = ["To Do", "In Progress", "Completed"];
const validPriorities = ["Low", "Medium", "High"];

// Create task (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
    if (!title || !projectId || !assignedTo || !dueDate) return res.status(400).json({ message: "Title, project, assigned member and due date are required" });
    if (title.trim().length < 3) return res.status(400).json({ message: "Task title must be at least 3 characters" });
    if (!isValidObjectId(projectId) || !isValidObjectId(assignedTo)) return res.status(400).json({ message: "Invalid project or member id" });
    if (priority && !validPriorities.includes(priority)) return res.status(400).json({ message: "Priority must be Low, Medium or High" });
    if (!isFutureOrToday(dueDate)) return res.status(400).json({ message: "Due date must be today or a future date" });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const member = await User.findById(assignedTo);
    if (!member || member.role !== "member") return res.status(400).json({ message: "Task can only be assigned to a member" });
    const isProjectMember = project.members.some((id) => id.toString() === assignedTo.toString());
    if (!isProjectMember) return res.status(400).json({ message: "Selected member is not part of this project team" });
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      project: projectId,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || "Medium",
      dueDate,
      status: "To Do",
    });
    const populated = await Task.findById(task._id)
      .populate("project", "name deadline")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({ message: "Task creation failed" });
  }
});

// Get tasks (admin sees all, member sees only assigned)
router.get("/", protect, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(query)
      .populate("project", "name deadline")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error.message);
    res.status(500).json({ message: "Could not fetch tasks" });
  }
});

// Update task status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task id" });
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Status must be: To Do, In Progress or Completed" });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && !isAssigned) return res.status(403).json({ message: "You can only update your own assigned tasks" });
    task.status = status;
    await task.save();
    const updated = await Task.findById(task._id)
      .populate("project", "name deadline")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");
    res.json(updated);
  } catch (error) {
    console.error("Update task status error:", error.message);
    res.status(500).json({ message: "Status update failed" });
  }
});

// Delete task (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task id" });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error.message);
    res.status(500).json({ message: "Could not delete task" });
  }
});

export default router;

import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { isFutureOrToday, isValidObjectId } from "../utils/validators.js";
const router = express.Router();

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, description, deadline } = req.body;
    if (!name || !description || !deadline) return res.status(400).json({ message: "Project name, description and deadline are required" });
    if (name.trim().length < 3) return res.status(400).json({ message: "Project name must be at least 3 characters" });
    if (description.trim().length < 5) return res.status(400).json({ message: "Description must be at least 5 characters" });
    if (!isFutureOrToday(deadline)) return res.status(400).json({ message: "Project deadline must be today or a future date" });
    const project = await Project.create({ name: name.trim(), description: description.trim(), deadline, createdBy: req.user._id, members: [] });
    const populated = await Project.findById(project._id).populate("createdBy", "name email role").populate("members", "name email role");
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: "Project creation failed" }); }
});

router.get("/", protect, async (req, res) => {
  const query = req.user.role === "admin" ? {} : { members: req.user._id };
  const projects = await Project.find(query).populate("createdBy", "name email role").populate("members", "name email role").sort({ createdAt: -1 });
  res.json(projects);
});

router.get("/:id/team", protect, async (req, res) => {
  if (!isValidObjectId(mongoose, req.params.id)) return res.status(400).json({ message: "Invalid project id" });
  const project = await Project.findById(req.params.id).populate("createdBy", "name email role").populate("members", "name email role");
  if (!project) return res.status(404).json({ message: "Project not found" });
  const isMember = project.members.some((member) => member._id.toString() === req.user._id.toString());
  if (req.user.role !== "admin" && !isMember) return res.status(403).json({ message: "You can view only your own project team" });
  res.json({ projectId: project._id, projectName: project.name, description: project.description, deadline: project.deadline, projectAdmin: project.createdBy, members: project.members });
});

router.post("/:id/members", protect, adminOnly, async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!isValidObjectId(mongoose, req.params.id) || !isValidObjectId(mongoose, memberId)) return res.status(400).json({ message: "Invalid project or member id" });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const member = await User.findById(memberId);
    if (!member || member.role !== "member") return res.status(400).json({ message: "Please select a valid member user" });
    const alreadyAdded = project.members.some((id) => id.toString() === memberId.toString());
    if (alreadyAdded) return res.status(400).json({ message: "Member already added to this project" });
    project.members.push(memberId);
    await project.save();
    const updated = await Project.findById(project._id).populate("createdBy", "name email role").populate("members", "name email role");
    res.json(updated);
  } catch (error) { res.status(500).json({ message: "Could not add member" }); }
});

router.delete("/:projectId/members/:memberId", protect, adminOnly, async (req, res) => {
  const { projectId, memberId } = req.params;
  if (!isValidObjectId(mongoose, projectId) || !isValidObjectId(mongoose, memberId)) return res.status(400).json({ message: "Invalid project or member id" });
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  project.members = project.members.filter((id) => id.toString() !== memberId.toString());
  await project.save();
  await Task.deleteMany({ project: projectId, assignedTo: memberId, status: { $ne: "Completed" } });
  const updated = await Project.findById(project._id).populate("createdBy", "name email role").populate("members", "name email role");
  res.json(updated);
});
export default router;

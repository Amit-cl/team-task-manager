import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/members", protect, adminOnly, async (req, res) => {
  try {
    const members = await User.find({ role: "member" }).select("name email role createdAt");
    res.json(members);
  } catch (error) {
    console.error("Get members error:", error.message);
    res.status(500).json({ message: "Could not fetch members" });
  }
});

export default router;

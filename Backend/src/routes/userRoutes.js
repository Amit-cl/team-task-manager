import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/members", protect, adminOnly, async (req, res) => {
  const members = await User.find({ role: "member" }).select("name email role createdAt");
  res.json(members);
});
export default router;

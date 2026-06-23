import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Task title is required"], trim: true, minlength: 3 },
  description: { type: String, trim: true, default: "" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["To Do", "In Progress", "Completed"], default: "To Do" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  dueDate: { type: Date, required: [true, "Due date is required"] },
}, { timestamps: true });

// Indexes for common queries
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model("Task", taskSchema);

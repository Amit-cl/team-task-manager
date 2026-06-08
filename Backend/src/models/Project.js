import mongoose from "mongoose";
const projectSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Project name is required"], trim: true, minlength: 3 },
  description: { type: String, required: [true, "Description is required"], trim: true, minlength: 5 },
  deadline: { type: Date, required: [true, "Deadline is required"] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });
export default mongoose.model("Project", projectSchema);

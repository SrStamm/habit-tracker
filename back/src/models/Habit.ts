import mongoose from "mongoose";
import { HabitType } from "@habits/shared/habit";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    type: { type: String, enum: Object.values(HabitType), required: true },
    target: { type: Number, min: 1 },
  },
  { timestamps: true },
);

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;

import mongoose from "mongoose";
import { GoalPeriod } from "@habits/shared/goal";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    amount: { type: Number, min: 1, required: true },
    period: { type: String, enum: Object.values(GoalPeriod), required: true },
  },
  { timestamps: true },
);

goalSchema.index({ userId: 1, habitId: 1 });

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;

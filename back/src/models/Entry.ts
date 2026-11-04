import mongoose from "mongoose";
import { workoutSchema } from "./subdocuments/Workout.schema";
import { lectureSchema } from "./subdocuments/Lecture.schema";

const entrySchema = new mongoose.Schema(
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

    dayKey: { type: String, required: true },
    value: { type: Number },
    completed: { type: Boolean },
    workout: {
      type: [workoutSchema],
    },
    lecture: {
      type: [lectureSchema],
    },
  },
  { timestamps: true },
);

entrySchema.index({ userId: 1, habitId: 1, dayKey: 1 }, { unique: true });

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;

import mongoose from "mongoose";

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

    date: { type: Date, required: true },
    value: { type: Number },
    completed: { type: Boolean, required: true },
  },
  { timestamps: true },
);

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;

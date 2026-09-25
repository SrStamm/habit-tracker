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

    dateKey: { type: String, required: true },
    value: { type: Number },
    completed: { type: Boolean },
  },
  { timestamps: true },
);

entrySchema.index({ userId: 1, habitId: 1, dateKey: 1 }, { unique: true });

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;

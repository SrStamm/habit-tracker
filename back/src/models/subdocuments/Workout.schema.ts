import mongoose from "mongoose";

export const workoutSchema = new mongoose.Schema({
  exercise: { type: String },
  sets: [{ reps: { type: Number }, weight: { type: Number } }],
});

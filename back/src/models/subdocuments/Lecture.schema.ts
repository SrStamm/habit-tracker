import mongoose from "mongoose";

export const lectureSchema = new mongoose.Schema({
  book: { type: String },
  chapter: { type: String },
  page: { type: Number },
});

import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
  verse: String,
  meaning: String,
  chapter: Number,
  verseNumber: Number
});

export default mongoose.model("Quote", quoteSchema);

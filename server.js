import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

import subscribeRoutes from "./routes/subscribeRoutes.js";
import { startDailyJob } from "./cron/dailyJob.js";
import Quote from "./models/Quote.js";
import { sendQuoteEmail } from "./services/emailService.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Serve frontend (public folder)
app.use(express.static("public"));

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connect error:", err));

// Routes
app.use("/api/subscribe", subscribeRoutes);

// Health route
app.get("/", (req, res) => res.send("VAANI API running"));

// Seed quotes from gitaQuotes.json into DB
app.get("/seed-quotes", async (req, res) => {
  try {
    const file = JSON.parse(fs.readFileSync("./gitaQuotes.json", "utf-8"));
    await Quote.deleteMany({});
    await Quote.insertMany(file);

    res.json({ message: "Seeded quotes", count: file.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST email route
app.get("/test-email", async (req, res) => {
  try {
    const testQuote = {
      verse: "You have the right to perform your duty, but not the fruits.",
      meaning: "Focus on your actions, not the results.",
      chapter: 2,
      verseNumber: 47,
    };

    await sendQuoteEmail("your_email_here@gmail.com", testQuote);

    res.send("Test email sent (check inbox + spam)");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending test email");
  }
});

// Start cron
startDailyJob();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

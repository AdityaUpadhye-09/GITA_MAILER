import express from "express";
import Subscriber from "../models/Subscriber.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    email = email.toLowerCase().trim();
    const exists = await Subscriber.findOne({ email });
    if (exists) return res.status(409).json({ message: "Already subscribed!" });
    await Subscriber.create({ email });
    res.status(201).json({ message: "Subscribed Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    const removed = await Subscriber.findOneAndDelete({ email: email.toLowerCase().trim() });
    if (!removed) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Unsubscribed Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

import cron from "node-cron";
import Subscriber from "../models/Subscriber.js";
import Quote from "../models/Quote.js";
import { sendQuoteEmail } from "../services/emailService.js";

const lastQuoteMap = {}; // last sent quote per subscriber

export function startDailyJob() {
  cron.schedule("*/1 * * * *", async () => { // change for final
    console.log("⏰ Cron running, sending quotes...");
    try {
      const subs = await Subscriber.find().lean();
      if (!subs.length) return console.log("No subscribers");

      const count = await Quote.countDocuments();
      if (!count) return console.log("No quotes in DB");

      for (const s of subs) {
        let selected = null;
        let attempts = 0;

        while (!selected && attempts < 20) { // try enough times
          const randomIndex = Math.floor(Math.random() * count);
          selected = await Quote.findOne().skip(randomIndex);

          // skip if same as last sent to this subscriber
          if (lastQuoteMap[s.email] === selected._id.toString()) {
            selected = null;
            attempts++;
          }
        }

        if (!selected) {
          console.log(`No new quote for ${s.email}`);
          continue;
        }

        lastQuoteMap[s.email] = selected._id.toString(); // update last quote

        try {
          await sendQuoteEmail(s.email, selected);
          console.log(`Email sent to ${s.email}`);
        } catch (e) {
          console.error("Failed for", s.email, e);
        }
      }

      console.log("✅ Done sending batch");
    } catch (err) {
      console.error("Cron job error:", err);
    }
  });
}

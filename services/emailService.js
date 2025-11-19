import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendQuoteEmail(to, quote) {
  const from = `${process.env.SENDER_NAME || "VAANI"} <${process.env.FROM_EMAIL}>`;
  const text = `"${quote.verse}"

Meaning: ${quote.meaning}

— Chapter ${quote.chapter}, Verse ${quote.verseNumber}
`;
  const html = `
    <div style="font-family:Inter,system-ui,Arial;line-height:1.4">
      <h3>🌼 Bhagavad Gita Quote</h3>
      <blockquote style="font-size:18px">"${quote.verse}"</blockquote>
      <p><strong>Meaning:</strong> ${quote.meaning}</p>
      <p>— Chapter ${quote.chapter}, Verse ${quote.verseNumber}</p>
      <hr/>
      <p><small>From Krishna VAANI</small></p>
    </div>
  `;
  try {
    await resend.emails.send({ from, to, subject: "🌼 Your Daily Bhagavad Gita Quote", text, html });
    console.log("Email sent to", to);
  } catch (err) {
    console.error("Resend error:", err);
    throw err;
  }
}

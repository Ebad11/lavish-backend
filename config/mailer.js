// config/mailer.js
const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.warn("Warning: RESEND_API_KEY not set.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ to, subject, html, text }) {
  const from = process.env.FROM_EMAIL;
  const toEmail = to || process.env.ADMIN_EMAIL;

  if (!from) throw new Error("FROM_EMAIL not configured");
  if (!toEmail) throw new Error("ADMIN_EMAIL not configured");

  try {
    const response = await resend.emails.send({
      from,
      to: toEmail,
      subject,
      html,
      text,
    });

    return response; // { id: "...", to: [], from: "" }
  } catch (err) {
    const message = err?.message || JSON.stringify(err);
    const e = new Error(`Resend send failed: ${message}`);
    e.original = err;
    throw e;
  }
}

module.exports = { sendMail };

// config/mailer.js
const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.warn("Warning: RESEND_API_KEY not set. Emails will fail until set.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * sendMail
 * @param {Object} options
 * @param {string} options.to - recipient email (optional; falls back to ADMIN_EMAIL)
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} options.text
 * @returns {Promise<Object>} Resend response
 */
async function sendMail({ to, subject, html, text }) {
  const from = process.env.FROM_EMAIL || process.env.ADMIN_EMAIL;
  const toEmail = to || process.env.ADMIN_EMAIL;
  if (!toEmail) {
    throw new Error("No recipient (to) and ADMIN_EMAIL not set.");
  }

  try {
    const res = await resend.emails.send({
      from,
      to: toEmail,
      subject,
      html,
      text,
    });
    // res is the API response (an object). Keep it for logging if needed.
    return res;
  } catch (err) {
    // normalize error for your calling code
    const message = err?.message || JSON.stringify(err);
    const e = new Error(`Resend send failed: ${message}`);
    e.original = err;
    throw e;
  }
}

module.exports = { sendMail };

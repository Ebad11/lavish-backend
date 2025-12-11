// scripts/send-test-email.js
require("dotenv").config();
const { sendMail } = require("../config/mailer");

(async function run() {
  try {
    const res = await sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: "Resend domain verification test",
      html: "<p>If you get this — domain & MAIL_FROM are working ✅</p>",
    });
    console.log("Send response:", res);
  } catch (err) {
    console.error("Send failed:", err);
  }
})();

const ContactMessage = require("../models/ContactMessage");
const { sendMail } = require("../config/mailer");

exports.submit = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;
    if (!firstName || !lastName || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: "All fields required" });
    }

    const saved = await ContactMessage.create({ firstName, lastName, email, phone, subject, message });

    // send email to admin
    const html = `
      <h3>New contact enquiry</h3>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
    `;
    await sendMail({
      subject: `Contact form: ${subject}`,
      html,
      text: `${firstName} ${lastName} - ${email} - ${phone}\n\n${message}`,
    });

    res.json({ ok: true, saved });
  } catch (err) {
    console.error("contact error", err);
    res.status(500).json({ error: "server error" });
  }
};

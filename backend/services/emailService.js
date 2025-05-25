const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (to, subject, text, html = null) => {
  const mailOption = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  //   if (html) {
  //     mailOption.html = html;
  //   }

  try {
    const email = transporter.sendMail(mailOption);
    return email;
  } catch (e) {
    console.error("Error sending email:", e);
    throw e;
  }
};

module.exports = { sendEmail };

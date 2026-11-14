const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

async function sendLeadEmail({ visitorName, visitorEmail, messageBody }) {
  const mailOptions = {
    from: `"Nexora Portfolio Bot" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: visitorEmail,
    subject: `New Lead from Portfolio: ${visitorName}`,
    text: `You have a new lead from your portfolio chatbot (Nexora).

    Name: ${visitorName}
    Email: ${visitorEmail}

    Message:
    ${messageBody}
        `.trim(),
    };

  await transporter.sendMail(mailOptions);
}

async function sendResetCodeEmail({ to, code, minutes }) {
  await transporter.sendMail({
    from: `"Portfolio Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your admin panel password reset code",
    text: `Your password reset code is: ${code}

This code is valid for ${minutes} minutes and can be used only once.
If you did not request this, ignore this email. Your password has not changed.`,
  });
}

module.exports = { sendLeadEmail, sendResetCodeEmail };
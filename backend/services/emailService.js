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

module.exports = { sendLeadEmail };
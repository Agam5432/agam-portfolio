const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendLeadEmail({ visitorName, visitorEmail, messageBody }) {
  await resend.emails.send({
    from: "Nexora Portfolio Bot <onboarding@resend.dev>",
    to: [process.env.EMAIL_USER],
    replyTo: visitorEmail,
    subject: `New Lead from Portfolio: ${visitorName}`,
    html: `
      <h3>You have a new lead from your portfolio chatbot (Nexora)</h3>
      <p><strong>Name:</strong> ${visitorName}</p>
      <p><strong>Email:</strong> ${visitorEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${messageBody}</p>
    `,
  });
}

module.exports = { sendLeadEmail };
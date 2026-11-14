// Emails go out through Resend's HTTPS API. Gmail SMTP (nodemailer) does not work on
// Render: outbound SMTP ports are blocked on free instances, which is why lead emails never arrived.
const { Resend } = require("resend");

// Created lazily: `new Resend(undefined)` throws, which would crash the whole server at startup if the key is missing.
let client = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set on the server");
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}
const FROM = process.env.MAIL_FROM || "Portfolio <onboarding@resend.dev>";
// With Resend's shared sender, mail can only be delivered to the Resend account's own email.
const OWNER_EMAIL = process.env.OWNER_EMAIL || "agamtyagi2001@gmail.com";

const esc = (v) => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function send(payload) {
  const { error } = await getResend().emails.send({ from: FROM, ...payload });
  if (error) throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
}

async function sendLeadEmail({ visitorName, visitorEmail, visitorPhone, reason, messageBody }) {
  await send({
    to: [OWNER_EMAIL],
    replyTo: visitorEmail,
    subject: `New Lead from Portfolio: ${String(visitorName).replace(/[\r\n]/g, " ").slice(0, 80)}`,
    html: `<h3>New lead from your portfolio chatbot (Nexora)</h3>
      <p><strong>Name:</strong> ${esc(visitorName)}</p>
      <p><strong>Email:</strong> ${esc(visitorEmail)}</p>
      <p><strong>Mobile:</strong> ${esc(visitorPhone || "—")}</p>
      <p><strong>Reason:</strong> ${esc(reason || "—")}</p>
      <p><strong>Message:</strong><br>${esc(messageBody).replace(/\n/g, "<br>")}</p>`,
  });
}

async function sendResetCodeEmail({ to, code, minutes }) {
  await send({
    to: [to],
    subject: "Your admin panel password reset code",
    text: `Your password reset code is: ${code}

This code is valid for ${minutes} minutes and can be used only once.
If you did not request this, ignore this email. Your password has not changed.`,
  });
}

module.exports = { sendLeadEmail, sendResetCodeEmail };

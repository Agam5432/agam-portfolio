const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Writes the message body of the lead email, in the visitor's voice, to Agam.
async function generateDraft({ name, email, phone, reason, extra, recentHistory = [] }) {
  const convo = recentHistory.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n");
  const prompt = `
Write the body of a short, professional email from a website visitor to Agam Tyagi (an AI engineer). The visitor's chatbot is sending it on their behalf.

Visitor name: ${name}
Visitor email: ${email}
Visitor mobile: ${phone}
Reason for contacting: ${reason}
${extra ? `Visitor's requested change: ${extra}` : ""}

Conversation context:
${convo || "(none)"}

Rules: first person as the visitor, 3-5 sentences, clearly state what they want and invite Agam to reply. Use only the facts above; do not invent companies, roles, dates or numbers. No greeting line, no sign-off, no subject line. Plain text.
  `.trim();
  const r = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 250,
    temperature: 0.4,
  });
  return r.choices[0]?.message?.content?.trim() || reason;
}

module.exports = { generateDraft };

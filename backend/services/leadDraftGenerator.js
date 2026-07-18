const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateDraft({ name, email, rawMessage, recentHistory }) {
  const conversationSnippet = recentHistory
    .slice(-6)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `
You are drafting a short, professional lead email on behalf of a website visitor to send to Agam Tyagi (a developer).

Visitor name: ${name}
Visitor email: ${email}
Visitor's raw message/intent: ${rawMessage}

Relevant conversation context:
${conversationSnippet}

Write a concise, professional message (3-5 sentences) summarizing what the visitor wants, based on their message and the conversation context. Write it in first person, as if the visitor is speaking. Do not add a greeting or sign-off, just the message body.
  `.trim();

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content?.trim() || rawMessage;
}

module.exports = { generateDraft };
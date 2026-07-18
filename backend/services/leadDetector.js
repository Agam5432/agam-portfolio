const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function detectInterest(userMessage, recentHistory) {
  const conversationSnippet = recentHistory
    .slice(-4)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `
Analyze this conversation between a visitor and a portfolio chatbot (Nexora, representing Agam Tyagi, a developer).

Conversation:
${conversationSnippet}
user: ${userMessage}

Does the visitor show signs of being a serious lead — e.g. interested in hiring Agam, discussing a job/project opportunity, asking about availability/rates/collaboration, or expressing intent to work with him?

Respond with ONLY one word: "yes" or "no". Do not explain.
  `.trim();

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 5,
    temperature: 0,
  });

  const answer = response.choices[0]?.message?.content?.trim().toLowerCase();
  return answer === "yes";
}

module.exports = { detectInterest };
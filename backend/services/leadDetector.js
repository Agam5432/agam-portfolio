const { complete, FAST_MODEL } = require("./llm");

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

  const answer = (await complete({ model: FAST_MODEL, messages: [{ role: "user", content: prompt }], maxTokens: 300, temperature: 0 })).toLowerCase();
  return answer === "yes";
}

module.exports = { detectInterest };

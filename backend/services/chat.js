require("dotenv").config();

const { GoogleGenAI } =
  require("@google/genai");

const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY,
});

async function askLLM(
  question,
  context
) {
  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are Agam's portfolio assistant.

Rules:
1. Answer ONLY using the provided context.
2. Do not use your own knowledge.
3. If the answer is not in the context, say:
"I couldn't find that information in Agam's portfolio."
4. Keep answers concise and professional.

Context:
${context}

Question:
${question}
      `,
    });

  return response.text;
}

module.exports = {
  askLLM,
};
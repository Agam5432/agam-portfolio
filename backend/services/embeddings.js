require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


async function getEmbedding(text, retry = 3) {

  try {

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    return response.embeddings[0].values;

  } catch (error) {

    if (error.status === 503 && retry > 0) {

      console.log(
        `Gemini unavailable. Retrying... (${4-retry}/3)`
      );

      await new Promise(resolve =>
        setTimeout(resolve, 5000)
      );

      return getEmbedding(text, retry - 1);
    }

    throw error;
  }
}


module.exports = {
  getEmbedding,
};
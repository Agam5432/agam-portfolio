// One place for the Groq client and model names. Override with env vars if Groq retires a model again.
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Main chat answers.
const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";
// Cheap, fast helper tasks (intent detection, name extraction).
const FAST_MODEL = process.env.GROQ_FAST_MODEL || "openai/gpt-oss-20b";

// gpt-oss models are reasoning models: reasoning tokens count against max_tokens,
// so keep effort low and leave generous headroom or the visible answer can come back empty.
async function complete({ model = CHAT_MODEL, messages, maxTokens = 1200, temperature = 0.5 }) {
  const r = await groq.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    reasoning_effort: "low",
  });
  return r.choices[0]?.message?.content?.trim() || "";
}

module.exports = { groq, complete, CHAT_MODEL, FAST_MODEL };

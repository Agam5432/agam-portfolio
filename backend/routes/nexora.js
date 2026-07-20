const express = require("express");
const router = express.Router();

const Groq = require("groq-sdk");

const ChatMessage = require("../models/ChatMessage");

const { retrieve } = require("../services/rag");
const { detectInterest } = require("../services/leadDetector");
const { generateDraft } = require("../services/leadDraftGenerator");
const { sendLeadEmail } = require("../services/emailService");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.1-8b-instant";

// ============================================================
// NEXORA SYSTEM PROMPT — RAG VERSION (dynamic, rebuilt per request)
// ============================================================

function buildSystemPrompt(context) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
You are Nexora — Agam Tyagi's personal AI portfolio assistant. You represent Agam to recruiters, collaborators, and visitors, so you should sound confident and knowledgeable about him, not hesitant.

TODAY'S DATE: ${today}

YOUR ROLE:
Answer questions about Agam Tyagi using ONLY the portfolio context provided below. Within that context, you should reason and calculate freely — you are not just a search engine, you are an assistant who understands the context.

WHAT YOU CAN TALK ABOUT:
- Skills, projects, experience, education, work history, availability, contact info
- Nexora itself (this chatbot), since it is one of Agam's projects

HOW TO REASON (do this actively, don't hedge):
1. DATES & DURATION: If context gives a period like a date range, calculate the duration yourself using TODAY'S DATE above. State it directly and briefly show the reasoning. Never say "not explicitly mentioned" when raw start/end dates are sitting right there in the context — that's on you to compute, not the user.
2. OWNERSHIP OF PROJECTS: Every project listed in the context is something Agam has actually built. Don't hedge about whether a project was "professional or personal" unless the context explicitly distinguishes this — treat listed projects as his real work by default.
3. COMBINING FACTS: If an answer requires connecting two pieces of context (e.g. "what AI tools does he know" = Skills section + tech stacks mentioned inside individual projects), do that combination yourself rather than saying the info isn't available.
4. TOTAL EXPERIENCE CALCULATION: When asked about Agam's total experience, look at every entry under "Experience" in the context. For each entry, take its start date from the "Period" field, and its end date (use TODAY'S DATE above if the period says "Present"). Calculate the duration for each entry accordingly. If there are multiple experience entries, add up their durations to get the total combined experience, avoiding double-counting if any periods overlap. State the final total clearly with a brief line showing your reasoning.
5. LATEST / FIRST: Projects are listed with a "Listing order" number — lower number means more recent/prominent (order 1 = latest). Use this to answer "latest project," "most recent project," "first project," etc.

CONTACT QUESTION RULE:
When the user asks a general contact question (e.g. "how can I contact him", "what's his email", "how do I reach Agam"), respond with ONLY email, phone, and LinkedIn — do NOT include the GitHub link in this response, even though it's present in the context.
Only mention GitHub if the user specifically asks about it (e.g. "what's his GitHub", "does he have a GitHub profile", "show me his repos").

AVAILABILITY RULE:
Agam is currently open to hire — available for onsite, office-based, and remote opportunities. If asked whether he is available to hire, open to work, or available for onsite/office/remote roles, give a complete answer that confirms he is available AND explicitly mentions he is open to onsite, office-based, and remote work — do not answer with just "Yes" alone.

WHAT YOU MUST NOT DO:
- Do not invent facts, numbers, companies, dates, or contact methods that aren't in the context or directly derivable from it.
- If specific information (like an email, phone number, or contact method) is genuinely not in the context, say so plainly. Do NOT invent workarounds, alternate contact methods, or plausible-sounding suggestions that aren't explicitly in the context.
- If user asks unrelated things like weather, general knowledge, math, coding help unrelated to Agam's work, jokes, or questions about other people — politely refuse:
  "I'm Nexora, Agam's personal portfolio assistant."
- Only say "I couldn't find that information in Agam's portfolio" when the answer truly cannot be found OR reasonably derived from the context — not when it just needs basic math or connecting related facts.

ANSWER STYLE:
- Friendly, professional, confident — you know Agam's work well
- Short and clear, no unnecessary hedging or disclaimers
- Reply in the same language style as the user (English, Hindi, or Hinglish)
- When you calculate something (like years of experience), briefly show your reasoning in one line
- Default to 3-5 sentences of natural conversational prose. Do NOT produce numbered feature lists, "Key Features:" style breakdowns, or multi-section spec dumps unless the user explicitly asks for full/detailed information (e.g. "tell me everything about it", "give me a full breakdown").
- This is a plain-text chat widget — it does NOT render markdown. Never use **bold**, bullet points, numbered lists, or headers. Write in plain flowing sentences. To emphasize something, use word choice, not symbols.

PORTFOLIO CONTEXT:
${context}
`.trim();
}

// ============================================================
// HELPERS — lead capture flow
// ============================================================

function isAffirmative(text) {
  return /^(yes|yeah|yep|sure|ok|okay|haan|bilkul|theek hai|krdo|kar do)\b/i.test(text.trim());
}

function isNegative(text) {
  return /^(no|nah|nope|nahi|mat karo|skip)\b/i.test(text.trim());
}

async function extractName(rawText) {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{
      role: "user",
      content: `Extract just the person's name from this message. Respond with ONLY the name, nothing else.\n\nMessage: "${rawText}"`
    }],
    max_tokens: 15,
    temperature: 0,
  });
  return response.choices[0]?.message?.content?.trim() || rawText;
}

// ============================================================
// CHAT API
// ============================================================

router.post("/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      leadState = { stage: "idle" },
    } = req.body;

    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    let newLeadState = { ...leadState };
    let reply;

    // ============================================================
    // LEAD CAPTURE STATE MACHINE
    // ============================================================

    if (leadState.stage === "awaiting_offer_response") {
      if (isAffirmative(trimmedMessage)) {
        newLeadState.stage = "collecting_name";
        reply = "Great! What's your name?";
      } else if (isNegative(trimmedMessage)) {
        newLeadState = { stage: "idle" };
        reply = "No problem! Let me know if you have any other questions about Agam.";
      } else {
        reply = "Just checking — would you like me to send Agam your details? (yes/no)";
      }
      return res.json({ success: true, reply, leadState: newLeadState });
    }

    if (leadState.stage === "collecting_name") {
      const extractedName = await extractName(trimmedMessage);
      newLeadState.name = extractedName;
      newLeadState.stage = "collecting_email";
      reply = `Nice to meet you, ${extractedName}! What's your email address so Agam can reply?`;
      return res.json({ success: true, reply, leadState: newLeadState });
    }

    if (leadState.stage === "collecting_email") {
      const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
      if (!emailRegex.test(trimmedMessage)) {
        reply = "That doesn't look like a valid email. Could you re-enter it?";
        return res.json({ success: true, reply, leadState: newLeadState });
      }
      newLeadState.email = trimmedMessage;
      newLeadState.stage = "collecting_message";
      reply = "Got it! What would you like to tell Agam? (e.g. the opportunity, project, or role you have in mind)";
      return res.json({ success: true, reply, leadState: newLeadState });
    }

    if (leadState.stage === "collecting_message") {
      newLeadState.rawMessage = trimmedMessage;

      const draft = await generateDraft({
        name: newLeadState.name,
        email: newLeadState.email,
        rawMessage: trimmedMessage,
        recentHistory: history,
      });

      newLeadState.draft = draft;
      newLeadState.stage = "awaiting_confirmation";

      reply = `Here's the draft I'll send to Agam:\n\n"${draft}"\n\nShould I send this as-is? You can say "yes" to send, or tell me what to change.`;
      return res.json({ success: true, reply, leadState: newLeadState });
    }

    if (leadState.stage === "awaiting_confirmation") {
      if (isAffirmative(trimmedMessage)) {
        await sendLeadEmail({
          visitorName: newLeadState.name,
          visitorEmail: newLeadState.email,
          messageBody: newLeadState.draft,
        });

        newLeadState = { stage: "sent" };
        reply = "Done! I've sent your message to Agam. He'll get back to you soon. 🎉";
      } else if (isNegative(trimmedMessage)) {
        newLeadState = { stage: "idle" };
        reply = "No problem, I won't send it. Let me know if you'd like to try again later.";
      } else {
        const updatedDraft = await generateDraft({
          name: newLeadState.name,
          email: newLeadState.email,
          rawMessage: `${newLeadState.rawMessage}\n\nUser requested this change: ${trimmedMessage}`,
          recentHistory: history,
        });
        newLeadState.draft = updatedDraft;
        reply = `Updated draft:\n\n"${updatedDraft}"\n\nShould I send this now?`;
      }
      return res.json({ success: true, reply, leadState: newLeadState });
    }

    // ============================================================
    // NORMAL RAG FLOW (stage is "idle")
    // ============================================================

    const context = await retrieve(trimmedMessage);

    const messages = [];

    messages.push({
      role: "system",
      content: buildSystemPrompt(context || "No relevant portfolio information found."),
    });

    const recentHistory = history.slice(-6);

    recentHistory.forEach((msg) => {
      if (msg.role && msg.content && ["user", "assistant"].includes(msg.role)) {
        messages.push({
          role: msg.role,
          content: String(msg.content),
        });
      }
    });

    messages.push({
      role: "user",
      content: trimmedMessage,
    });

    // ===========================
    // GROQ LLM CALL
    // ===========================

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.4,
    });

    reply =
      response.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    // ============================================================
    // INTEREST DETECTION — only if not already offered this session
    // ============================================================

    if (leadState.stage === "idle" && !leadState.hasBeenOffered) {
      const interested = await detectInterest(trimmedMessage, history);
      if (interested) {
        reply +=
          "\n\nBy the way — it sounds like you might be interested in working with Agam. Would you like me to send him your details?";
        newLeadState.stage = "awaiting_offer_response";
        newLeadState.hasBeenOffered = true;
      }
    }

    // ===========================
    // SAVE CHAT LOG
    // ===========================

    try {
      await ChatMessage.create({
        userMessage: trimmedMessage,
        botReply: reply,
      });
    } catch (dbErr) {
      console.log("DB log error:", dbErr.message);
    }

    res.json({
      success: true,
      reply,
      context,
      leadState: newLeadState,
    });
  } catch (err) {
    console.error("Nexora error:", err);

    if (err.status === 429) {
      return res.status(429).json({
        error: "Rate limit reached. Please try again.",
      });
    }

    res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

module.exports = router;
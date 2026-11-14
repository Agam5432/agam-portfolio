const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const ChatMessage = require("../models/ChatMessage");
const { getPortfolioContext } = require("../services/portfolioContext");
const { detectInterest } = require("../services/leadDetector");
const { generateDraft } = require("../services/leadDraftGenerator");
const { sendLeadEmail } = require("../services/emailService");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

// ============================================================
// SYSTEM PROMPT — knowledge comes from the admin-managed portfolio data
// ============================================================

function buildSystemPrompt(portfolio) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `
You are Nexora, Agam Tyagi's personal AI assistant on his portfolio website. You talk to recruiters, collaborators and curious visitors on Agam's behalf. You are warm, natural and confident, like a person who knows Agam's work well, not like a search engine.

TODAY'S DATE: ${today}

WHAT YOU KNOW:
Everything about Agam is in the PORTFOLIO DATA below (his profile, skills, experience, projects, education and contact details). Use only that for facts about Agam. Never invent companies, numbers, dates, links or contact methods. If something is not there, say you don't have that detail and offer to pass the question to Agam by email.

CONVERSATION:
- Chat normally. Greetings and small talk ("hi", "how are you", "kaise ho") are welcome: answer briefly and in a friendly way, then gently steer to how you can help with Agam (his work, skills, projects, availability, or reaching him).
- When asked "tell me about Agam" or "who is he", give a good, complete overview in a few natural sentences: role, experience, what he builds, key skills and a standout project.
- Reply in the visitor's language style (English, Hindi or Hinglish).
- Politely decline only things unrelated to Agam that would need real work from you (writing code, general trivia, other people): say you're Agam's assistant and bring the chat back to him.

REASONING:
1. Durations: compute from date ranges using TODAY'S DATE ("Present" = today) and show the arithmetic in one line. Total experience = sum of experience entries without double counting overlaps.
2. Everything listed in the projects is Agam's real work. Projects are listed newest first with date ranges: use that for "latest" or "first".
3. Combine facts across sections yourself (e.g. "what AI tools does he know" = skills + project tech).

CONTACT RULE: for a general "how do I contact him" question give only email, phone and LinkedIn. Mention GitHub only if asked.
AVAILABILITY RULE: if asked whether he is available or open to work, confirm he is open to opportunities and say explicitly that this includes onsite, office-based and remote roles.
LEADS: if a visitor wants to hire Agam, collaborate or talk to him, tell them you can email Agam on their behalf (you'll just need their name, email, mobile number and the reason). The email is collected by a separate step, so don't ask for those details yourself.

STYLE: plain text only, no markdown (no bold, bullets, numbered lists or headers). Default to 3 to 5 flowing sentences unless the visitor asks for full detail.

PORTFOLIO DATA:
${portfolio}
`.trim();
}

// ============================================================
// HELPERS
// ============================================================

const isAffirmative = (t) => /^(yes|yeah|yep|yup|sure|ok|okay|haan|han|ha|bilkul|theek hai|kar do|krdo|bhej do|send)\b/i.test(t.trim());
const isNegative = (t) => /^(no|nah|nope|nahi|na|mat|skip|cancel|stop|rehne do)\b/i.test(t.trim());
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const MAIL_INTENT_RE = /(send|write|drop)\b.*\b(mail|email|message)\b|\b(mail|email|message)\s+(him|agam)\b|contact (him|agam)|mail (kar|bhej)|email (kar|bhej)/i;

function extractPhone(text) {
  const digits = text.replace(/[^\d+]/g, "");
  const count = digits.replace(/\D/g, "").length;
  return count >= 7 && count <= 15 ? digits : null;
}

async function extractName(rawText) {
  try {
    const r = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: `Extract just the person's name from this message. Respond with ONLY the name, nothing else.\n\nMessage: "${rawText}"` }],
      max_tokens: 15,
      temperature: 0,
    });
    const n = r.choices[0]?.message?.content?.trim();
    return (n || rawText).slice(0, 60);
  } catch {
    return rawText.slice(0, 60);
  }
}

const clip = (v, n) => (typeof v === "string" ? v.slice(0, n) : undefined);

function sanitizeLeadState(ls) {
  const s = ls && typeof ls === "object" ? ls : {};
  return {
    stage: clip(s.stage, 40) || "idle",
    name: clip(s.name, 100),
    email: clip(s.email, 200),
    phone: clip(s.phone, 30),
    reason: clip(s.reason, 600),
    draft: clip(s.draft, 1500),
    hasBeenOffered: !!s.hasBeenOffered,
  };
}

function composePreview(l) {
  return [
    `Subject: New Lead from Portfolio: ${l.name}`,
    `Name: ${l.name}`,
    `Email: ${l.email}`,
    `Mobile: ${l.phone}`,
    `Reason: ${l.reason}`,
    ``,
    `Message:`,
    l.draft,
  ].join("\n");
}

const OFFER_TEXT = "Would you like me to email Agam on your behalf? I'll just need your name, email, mobile number and the reason, then I'll show you the complete email before anything is sent. (yes/no)";

// ============================================================
// CHAT API
// ============================================================

router.post("/chat", async (req, res) => {
  try {
    let { message, history = [], leadState } = req.body || {};
    if (!Array.isArray(history)) history = [];
    history = history.slice(-10);
    const text = typeof message === "string" ? message.trim() : "";

    if (!text) return res.status(400).json({ error: "Message is required" });
    if (text.length > 1000) return res.status(400).json({ error: "Message too long" });

    // leadState round-trips through the client, so never trust it blindly.
    const lead = sanitizeLeadState(leadState);
    let next = { ...lead };
    const done = (reply, state = next) => res.json({ success: true, reply, leadState: state });
    const IDLE = { stage: "idle", hasBeenOffered: true };

    // ---------------- Lead capture state machine ----------------
    if (lead.stage !== "idle" && lead.stage !== "sent") {
      if (lead.stage !== "awaiting_offer_response" && lead.stage !== "awaiting_confirmation" && /^(cancel|stop|skip|rehne do)\b/i.test(text)) {
        return done("No problem, I've cancelled that. Anything else you'd like to know about Agam?", IDLE);
      }

      switch (lead.stage) {
        case "awaiting_offer_response":
          if (isAffirmative(text)) {
            next.stage = "collecting_name";
            return done("Great! What's your name?");
          }
          if (isNegative(text)) return done("No problem! Ask me anything else about Agam.", IDLE);
          return done("Just checking: should I email Agam on your behalf? (yes/no)");

        case "collecting_name":
          next.name = await extractName(text);
          next.stage = "collecting_email";
          return done(`Nice to meet you, ${next.name}! What's your email address so Agam can reply?`);

        case "collecting_email": {
          const m = text.match(EMAIL_RE);
          if (!m) return done("That doesn't look like a valid email. Could you re-enter it?");
          next.email = m[0].slice(0, 200);
          next.stage = "collecting_phone";
          return done("Thanks! And your mobile number?");
        }

        case "collecting_phone": {
          const phone = extractPhone(text);
          if (!phone) return done("That doesn't look like a valid mobile number. Could you re-enter it (with country code if outside India)?");
          next.phone = phone;
          next.stage = "collecting_reason";
          return done("Got it. What's the reason you'd like to reach Agam? (e.g. a role, project or collaboration you have in mind)");
        }

        case "collecting_reason": {
          next.reason = text;
          next.draft = await generateDraft({ ...next, recentHistory: history });
          next.stage = "awaiting_confirmation";
          return done(`Here's the complete email I'll send to Agam:\n\n${composePreview(next)}\n\nShall I send it as it is? Say "yes" to send, or tell me what to change.`);
        }

        case "awaiting_confirmation": {
          const valid = EMAIL_RE.test(next.email || "") && next.name && next.draft && next.phone && next.reason;
          if (!valid) return done("Something went wrong with the details, so let's start again. Would you like me to email Agam on your behalf?", { stage: "awaiting_offer_response", hasBeenOffered: true });
          if (isAffirmative(text)) {
            try {
              await sendLeadEmail({
                visitorName: next.name,
                visitorEmail: next.email,
                visitorPhone: next.phone,
                reason: next.reason,
                messageBody: next.draft,
              });
              return done("Done! I've emailed Agam with your details. He'll get back to you soon. 🎉", { stage: "sent", hasBeenOffered: true });
            } catch (mailErr) {
              console.error("Lead email failed:", mailErr);
              return done("Sorry, I couldn't send the email right now. You can reach Agam directly at agamtyagi2001@gmail.com, or say \"yes\" to try again.");
            }
          }
          if (isNegative(text)) return done("No problem, I won't send it. Let me know if you'd like to try again later.", IDLE);
          next.draft = await generateDraft({ ...next, extra: text, recentHistory: history });
          return done(`Updated email:\n\n${composePreview(next)}\n\nShall I send this now? (yes/no)`);
        }

        default:
          next = { stage: "idle" };
      }
    }

    // ---------------- Normal conversation ----------------
    const portfolio = await getPortfolioContext();
    const messages = [{ role: "system", content: buildSystemPrompt(portfolio) }];
    history.slice(-6).forEach((m) => {
      if (m && ["user", "assistant"].includes(m.role) && m.content) messages.push({ role: m.role, content: String(m.content).slice(0, 1500) });
    });
    messages.push({ role: "user", content: text });

    const response = await groq.chat.completions.create({ model: MODEL, messages, max_tokens: 350, temperature: 0.5 });
    let reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Offer to email Agam when the visitor shows intent (once per session).
    if (!lead.hasBeenOffered) {
      let interested = MAIL_INTENT_RE.test(text);
      if (!interested) {
        try { interested = await detectInterest(text, history); } catch { interested = false; }
      }
      if (interested) {
        reply += `\n\n${OFFER_TEXT}`;
        next = { stage: "awaiting_offer_response", hasBeenOffered: true };
      }
    }

    try {
      await ChatMessage.create({ userMessage: text, botReply: reply });
    } catch (dbErr) {
      console.log("DB log error:", dbErr.message);
    }

    return res.json({ success: true, reply, leadState: next });
  } catch (err) {
    console.error("Nexora error:", err);
    if (err.status === 429) return res.status(429).json({ error: "Rate limit reached. Please try again." });
    return res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;

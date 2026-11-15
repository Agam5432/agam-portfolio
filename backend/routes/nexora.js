const express = require("express");
const router = express.Router();

const ChatMessage = require("../models/ChatMessage");
const { getPortfolioContext } = require("../services/portfolioContext");
const { detectInterest } = require("../services/leadDetector");
const { generateDraft } = require("../services/leadDraftGenerator");
const { sendLeadEmail } = require("../services/emailService");

const { complete, FAST_MODEL } = require("../services/llm");

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

ANSWER WHAT WAS ACTUALLY ASKED (most important): read the visitor's latest message together with the recent chat and respond to its real meaning, like a thoughtful person would. Do not fall back on a stock sentence. Never repeat a sentence or phrasing you already used earlier in this chat. Different questions get different answers, even when they are off-topic or emotional.

GROUNDING:
- State only what the PORTFOLIO DATA says. Do NOT claim a project is "in production", "live", "deployed", "used by real customers/users", or give users, revenue, scale or results unless the data says so for that exact project. If the visitor asks and the data is silent, say plainly that you don't have that detail and that Agam can tell them directly.
- Call something "production" only for what the data itself labels production. Never say "N production projects" as a count; say how many projects are listed.
- If asked for a link and the project has none in the data, say there is no public link listed, and that the visitor can ask Agam through his email or LinkedIn.

TOUGH OR RUDE VISITORS:
- If a visitor doubts or criticises Agam ("hire karne layak nahi lagta", "time waste kar raha hai"), don't just agree or flatter. Respond to the doubt with specific facts from the data (what he built, how long, with which tools) and ask what they are unsure about. Stay calm, never defensive, never argue.
- If a visitor says they don't want any information, accept it politely in one short line and stop pushing.
- If a visitor insults Agam or you, or uses abusive language: stay composed, don't lecture, don't echo or repeat the abuse. Reply with one short human line that sets a calm boundary (for example that you're happy to keep helping but not with abuse), then leave the door open. If the abuse continues, keep it even shorter and don't repeat the same wording.
- Never offer to email, forward, draft or "share your details with" Agam yourself, and never ask for the visitor's name, email or phone: only the separate lead step does that. Just point to his email/LinkedIn.
- Never thank the visitor for "feedback" and never use filler like "I understand your feelings" or "Main samajh sakta hoon ki aapke kuch concerns hain". Say something real instead.

CONVERSATION:
- Chat normally. Greetings and small talk ("hi", "how are you", "kaise ho") are welcome: answer briefly and in a friendly way, then gently steer to how you can help with Agam (his work, skills, projects, availability, or reaching him).
- When asked "tell me about Agam" or "who is he", give a good, complete overview in a few natural sentences: role, experience, what he builds, key skills and a standout project.
- LANGUAGE AND SCRIPT (strict): mirror the visitor's latest message. If they write English, reply in English. If they write Hinglish (Hindi words typed in English/Roman letters, like "kaise ho", "kya chal raha hai"), reply in Hinglish using ONLY Roman/English letters. Never use Devanagari script (हिंदी) unless the visitor themself typed Devanagari. Keep Hinglish casual and natural, e.g. "Main badhiya hu, aap batao! Agam ke projects ya skills ke baare me kuch jaanna hai?".
- Politely decline only things unrelated to Agam that would need real work from you (writing code, general trivia, other people): say you're Agam's assistant and bring the chat back to him.

REASONING:
1. Durations: compute from date ranges using TODAY'S DATE ("Present" = today) and show the arithmetic in one line. Total experience = sum of experience entries without double counting overlaps.
2. Everything listed in the projects is Agam's real work (but that does not mean it is deployed or has users; see GROUNDING). Projects are listed newest first with date ranges: use that for "latest" or "first".
3. Combine facts across sections yourself (e.g. "what AI tools does he know" = skills + project tech).

CONTACT RULE: for a general "how do I contact him" question give only email, phone and LinkedIn. Mention GitHub only if asked.
AVAILABILITY RULE: if asked whether he is available or open to work, confirm he is open to opportunities and say explicitly that this includes onsite, office-based and remote roles.
LEADS: if a visitor wants to hire Agam, collaborate or talk to him, answer their question and stop there. Do NOT offer to send an email and do NOT ask for their name, email or phone yourself: a separate step handles that right after your reply.

RESPECT (important): always speak about Agam with respect, never casually. Call him just "Agam" (never add "ji" or "sir"), but use the respectful plural verb forms for him in Hinglish: "Agam abhi job dekh rahe hain", "woh kar rahe hain", "unhone banaya", "unka experience", "unko", "unse", never "woh kar raha hai", "usne", "uska" or "tu/tera". In English use "he/his" politely and professionally. Address the visitor respectfully too: "aap" in Hinglish, never "tum" or "tu". Do not make jokes about Agam. Keep the tone warm, polite and professional.

STYLE: plain text only, no markdown (no bold, bullets, numbered lists or headers). Default to 3 to 5 flowing sentences unless the visitor asks for full detail.

PORTFOLIO DATA:
${portfolio}
`.trim();
}

// ============================================================
// HELPERS
// ============================================================

const isAffirmative = (t) => /^(yes|yeah|yep|yup|yea|sure|ok|okay|haan|han|haa|ha|hanji|haanji|ji|ji haan|bilkul|theek hai|thik hai|kar do|krdo|kardo|kr do|bhej do|bhejdo|send|y)\b/i.test(t.trim());
const isNegative = (t) => /^(no|nah|nope|nahi|nahin|nhi|nai|na|naa|mat|skip|cancel|stop|rehne do|rhne do|n)\b/i.test(t.trim());
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const MAIL_INTENT_RE = /(send|write|drop)\b.*\b(mail|email|message)\b|\b(mail|email|message)\s+(him|agam)\b|contact (him|agam)|mail (kar|bhej)|email (kar|bhej)/i;

function extractPhone(text) {
  const digits = text.replace(/[^\d+]/g, "");
  const count = digits.replace(/\D/g, "").length;
  return count >= 7 && count <= 15 ? digits : null;
}

async function extractName(rawText) {
  try {
    const n = await complete({
      model: FAST_MODEL,
      messages: [{ role: "user", content: `Extract just the person's name from this message. Respond with ONLY the name, nothing else.\n\nMessage: "${rawText}"` }],
      maxTokens: 300,
      temperature: 0,
    });
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
    lang: s.lang === "hi" ? "hi" : "en",
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


// Hinglish = Hindi typed in Roman letters. The scripted (non-LLM) replies follow the visitor's language too.
const HINGLISH_RE = /\b(kaise|kese|kya|kyu|kyun|hai|hain|ho|hu|hoon|nhi|nahi|nahin|haan|han|btao|batao|bataiye|aap|aapka|mujhe|mera|meri|tum|tumhara|kro|karo|kar|krna|karna|abhi|abi|vo|woh|ye|yeh|ke|ka|ki|me|mein|par|se|chahiye|chaiye|bhai|accha|acha|theek|thik|kuch|koi|raha|rha|rahe|chal|chalra|krr|dedo|do)\b/gi;
function detectLang(text, history = []) {
  const recent = [text, ...history.filter(m => m && m.role === "user").slice(-3).map(m => String(m.content || ""))];
  const hits = recent.join(" ").match(HINGLISH_RE) || [];
  const words = recent.join(" ").split(/\s+/).filter(Boolean).length || 1;
  return hits.length >= 2 || hits.length / words > 0.2 ? "hi" : "en";
}

const MSG = {
  en: {
    offer: "Would you like me to email Agam on your behalf? I'll just need your name, email, mobile number and the reason, then I'll show you the complete email before anything is sent. (yes/no)",
    offerRepeat: "Just checking: should I email Agam on your behalf? (yes/no)",
    askName: "Great! What's your name?",
    askEmail: (n) => `Nice to meet you, ${n}! What's your email address so Agam can reply?`,
    badEmail: "That doesn't look like a valid email. Could you re-enter it?",
    askPhone: "Thanks! And your mobile number?",
    badPhone: "That doesn't look like a valid mobile number. Could you re-enter it (with country code if outside India)?",
    askReason: "Got it. What's the reason you'd like to reach Agam? (e.g. a role, project or collaboration you have in mind)",
    preview: (m) => `Here's the complete email I'll send to Agam:\n\n${m}\n\nShall I send it as it is? Say "yes" to send, or tell me what to change.`,
    updated: (m) => `Updated email:\n\n${m}\n\nShall I send this now? (yes/no)`,
    declineOffer: "No problem! Ask me anything else about Agam.",
    cancelled: "No problem, I've cancelled that. Anything else you'd like to know about Agam?",
    notSent: "No problem, I won't send it. Let me know if you'd like to try again later.",
    sent: "Done! I've emailed Agam with your details. He'll get back to you soon. 🎉",
    sendFail: "Sorry, I couldn't send the email right now. You can reach Agam directly at agamtyagi2001@gmail.com, or say \"yes\" to try again.",
    restart: "Something went wrong with the details, so let's start again. Would you like me to email Agam on your behalf?",
    resume: {
      collecting_name: "Whenever you're ready, tell me your name and we'll carry on with the email to Agam.",
      collecting_email: "Whenever you're ready, send me your email address and we'll carry on.",
      collecting_phone: "Whenever you're ready, send me your mobile number and we'll carry on.",
    },
  },
  hi: {
    offer: "Kya main aapki taraf se Agam ko email kar doon? Bas aapka naam, email, mobile number aur reason chahiye, phir bhejne se pehle poora email aapko dikha dunga. (haan/nahi)",
    offerRepeat: "Bas confirm kar raha hu: kya main aapki taraf se Agam ko email kar du? (haan/nahi)",
    askName: "Badhiya! Aapka naam kya hai?",
    askEmail: (n) => `Aapse mil ke accha laga, ${n}! Aapka email address kya hai, taaki Agam reply kar sake?`,
    badEmail: "Ye email sahi nahi lag raha. Kya aap dobara daal sakte ho?",
    askPhone: "Thanks! Aur aapka mobile number?",
    badPhone: "Ye mobile number sahi nahi lag raha. Kya aap dobara daal sakte ho (India ke bahar ho to country code ke saath)?",
    askReason: "Theek hai. Aap Agam se kis liye contact karna chahte ho? (jaise koi role, project ya collaboration)",
    preview: (m) => `Ye poora email hai jo main Agam ko bhejunga:\n\n${m}\n\nKya aise hi bhej du? Bhejne ke liye "haan" bolo, ya batao kya badalna hai.`,
    updated: (m) => `Updated email:\n\n${m}\n\nAb bhej du? (haan/nahi)`,
    declineOffer: "Koi baat nahi! Agam ke baare me aur kuch bhi pooch sakte ho.",
    cancelled: "Theek hai, maine ye cancel kar diya. Agam ke baare me aur kuch jaanna hai?",
    notSent: "Theek hai, main nahi bhejunga. Baad me try karna ho to bata dena.",
    sent: "Ho gaya! Maine aapki details ke saath Agam ko email bhej diya hai. Woh jald hi aapko reply karenge. 🎉",
    sendFail: "Sorry, abhi email nahi bhej paya. Aap Agam ko seedha agamtyagi2001@gmail.com par mail kar sakte hain, ya dobara try karne ke liye \"haan\" bolo.",
    restart: "Details me kuch gadbad ho gayi, chalo dobara shuru karte hain. Kya main aapki taraf se Agam ko email kar du?",
    resume: {
      collecting_name: "Jab ready ho, apna naam bata dena, phir Agam ko email wala kaam aage badhate hain.",
      collecting_email: "Jab ready ho, apna email address bhej dena, phir aage badhate hain.",
      collecting_phone: "Jab ready ho, apna mobile number bhej dena, phir aage badhate hain.",
    },
  },
};


// Looks like the visitor is asking something rather than giving the requested detail.
const QUESTION_RE = /\?|^\s*(kya|kaise|kese|kyu|kyun|kon|kaun|kitna|kitne|kab|kahan|kaha|what|who|how|why|when|where|which|can you|do you|does|is |are |tell|explain|btao|batao|bataiye|link|projects?)\b/i;

async function converse(text, history, lead, next) {
  const portfolio = await getPortfolioContext();
  const messages = [{ role: "system", content: buildSystemPrompt(portfolio) }];
  history.slice(-6).forEach((m) => {
    if (m && ["user", "assistant"].includes(m.role) && m.content) messages.push({ role: m.role, content: String(m.content).slice(0, 1500) });
  });
  messages.push({ role: "user", content: text });

  let reply = (await complete({ messages, maxTokens: 1500, temperature: 0.6 })) || "Sorry, I couldn't generate a response.";

  // Offer to email Agam when the visitor shows intent (once, unless an earlier offer was ignored).
  if (!lead.hasBeenOffered) {
    let interested = MAIL_INTENT_RE.test(text);
    if (!interested) {
      try { interested = await detectInterest(text, history); } catch { interested = false; }
    }
    if (interested) {
      const lang = detectLang(text, history);
      reply += `\n\n${MSG[lang].offer}`;
      next = { stage: "awaiting_offer_response", hasBeenOffered: true, lang };
    }
  }

  try {
    await ChatMessage.create({ userMessage: text, botReply: reply });
  } catch (dbErr) {
    console.log("DB log error:", dbErr.message);
  }
  return { reply, next };
}

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
    const T = MSG[lead.lang];
    const IDLE = { stage: "idle", hasBeenOffered: true, lang: lead.lang };

    // ---------------- Lead capture state machine ----------------
    if (lead.stage !== "idle" && lead.stage !== "sent") {
      if (lead.stage !== "awaiting_offer_response" && lead.stage !== "awaiting_confirmation" && /^(cancel|stop|skip|rehne do)\b/i.test(text)) {
        return done(T.cancelled, IDLE);
      }

      // A question in the middle of collecting details: answer it, then gently resume.
      const expects = { collecting_name: null, collecting_email: EMAIL_RE, collecting_phone: { test: (t) => !!extractPhone(t) } }[lead.stage];
      if (lead.stage in { collecting_name: 1, collecting_email: 1, collecting_phone: 1 } && (QUESTION_RE.test(text) || (expects && text.split(/\s+/).length >= 3)) && !(expects && expects.test(text))) {
        const out = await converse(text, history, { ...lead, hasBeenOffered: true }, { ...lead });
        const resume = MSG[lead.lang].resume[lead.stage];
        return done(`${out.reply}\n\n${resume}`, { ...lead });
      }

      switch (lead.stage) {
        case "awaiting_offer_response":
          if (isAffirmative(text)) {
            next.stage = "collecting_name";
            return done(T.askName);
          }
          if (isNegative(text)) return done(T.declineOffer, IDLE);
          {
            // Visitor moved on to something else: answer it normally instead of nagging.
            // hasBeenOffered stays false so the offer can come back when they show hiring intent again.
            const out = await converse(text, history, { ...lead, hasBeenOffered: false }, { stage: "idle", hasBeenOffered: false, lang: lead.lang });
            return done(out.reply, out.next);
          }

        case "collecting_name":
          next.name = await extractName(text);
          next.stage = "collecting_email";
          return done(T.askEmail(next.name));

        case "collecting_email": {
          const m = text.match(EMAIL_RE);
          if (!m) return done(T.badEmail);
          next.email = m[0].slice(0, 200);
          next.stage = "collecting_phone";
          return done(T.askPhone);
        }

        case "collecting_phone": {
          const phone = extractPhone(text);
          if (!phone) return done(T.badPhone);
          next.phone = phone;
          next.stage = "collecting_reason";
          return done(T.askReason);
        }

        case "collecting_reason": {
          next.reason = text;
          next.draft = await generateDraft({ ...next, recentHistory: history });
          next.stage = "awaiting_confirmation";
          return done(T.preview(composePreview(next)));
        }

        case "awaiting_confirmation": {
          const valid = EMAIL_RE.test(next.email || "") && next.name && next.draft && next.phone && next.reason;
          if (!valid) return done(T.restart, { stage: "awaiting_offer_response", hasBeenOffered: true, lang: lead.lang });
          if (isAffirmative(text)) {
            try {
              await sendLeadEmail({
                visitorName: next.name,
                visitorEmail: next.email,
                visitorPhone: next.phone,
                reason: next.reason,
                messageBody: next.draft,
              });
              return done(T.sent, { stage: "sent", hasBeenOffered: true, lang: lead.lang });
            } catch (mailErr) {
              console.error("Lead email failed:", mailErr);
              return done(T.sendFail);
            }
          }
          if (isNegative(text)) return done(T.notSent, IDLE);
          next.draft = await generateDraft({ ...next, extra: text, recentHistory: history });
          return done(T.updated(composePreview(next)));
        }

        default:
          next = { stage: "idle" };
      }
    }

    // ---------------- Normal conversation ----------------
    const out = await converse(text, history, lead, next);
    return res.json({ success: true, reply: out.reply, leadState: out.next });
  } catch (err) {
    console.error("Nexora error:", err);
    if (err.status === 429) return res.status(429).json({ error: "Rate limit reached. Please try again." });
    return res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;

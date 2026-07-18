const { getEmbedding } = require("./embeddings");
const { searchChunks, fetchByType, fetchAllChunks } = require("./vectorStore");
const { classifyQuery } = require("../utils/queryClassifier");

// ⚠️ ASSUMPTION: order=1 ko "sabse recent/prominent" maana ja raha hai.
// Agar galat nikle, sirf yeh flip kar dena: "asc" -> "desc"
const LATEST_PROJECT_SORT_ORDER = "asc";
const LATEST_EXPERIENCE_SORT_ORDER = "asc";

const SMALL_CORPUS_CHAR_LIMIT = 12000;

function formatChunk(item) {
  const p = item.payload;
  const orderInfo = p.type === "project" ? ` (Listing order: ${p.order})` : "";
  return `[${p.type.toUpperCase()}]${orderInfo} ${p.title || ""}\n${p.text}`;
}

async function retrieve(question) {
  try {
    console.log("\n====================");
    console.log("USER QUERY:", question);
    console.log("====================");

    // ==========================
    // STEP 1: Small corpus check
    // Portfolio chota hai -> poora context de do, retrieval skip
    // ==========================
    const allChunks = await fetchAllChunks();
    const totalChars = allChunks.reduce((sum, c) => sum + (c.payload.text?.length || 0), 0);

    if (totalChars <= SMALL_CORPUS_CHAR_LIMIT) {
      console.log(`Small corpus (${totalChars} chars) — sending full context, no retrieval needed.`);
      return allChunks.map(formatChunk).join("\n\n");
    }

    // ==========================
    // STEP 2: Query classification + routing (bada corpus hone par)
    // ==========================
    const queryType = classifyQuery(question);
    console.log("Query classified as:", queryType);

    switch (queryType) {
      case "temporal_latest": {
        const chunks = await fetchByType("project", "order", LATEST_PROJECT_SORT_ORDER);
        if (!chunks.length) return "";
        return formatChunk(chunks[0]);
      }

      case "temporal_first": {
        const chunks = await fetchByType("experience", "order", LATEST_EXPERIENCE_SORT_ORDER === "asc" ? "desc" : "asc");
        if (!chunks.length) return "";
        return formatChunk(chunks[0]);
      }

      case "enumeration": {
        const type = /skill/.test(question.toLowerCase()) ? "skills" : "project";
        const chunks = await fetchByType(type, "order", "asc");
        return chunks.map(formatChunk).join("\n\n");
      }

      case "summarization": {
        const relevant = allChunks.filter((c) => ["experience", "project", "about", "profile"].includes(c.payload.type));
        return relevant.map(formatChunk).join("\n\n");
      }

      case "comparison":
      case "general_lookup":
      default: {
        const embedding = await getEmbedding(question);
        const results = await searchChunks(embedding, 8);

        const relevantResults = results.filter((item) => item.score >= 0.45);
        const finalResults = relevantResults.length > 0 ? relevantResults : results.slice(0, 8);

        return finalResults.map(formatChunk).join("\n\n");
      }
    }
  } catch (error) {
    console.error("RAG Error:", error);
    return "";
  }
}

module.exports = { retrieve };
require("dotenv").config();

const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION = "portfolio_chunks";

async function createCollection() {
  const collections = await client.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION);

  if (exists) {
    console.log("Collection already exists");
    return;
  }

  await client.createCollection(COLLECTION, {
    vectors: { size: 3072, distance: "Cosine" },
  });

  console.log("Collection created");
}

async function insertChunks(docs) {
  await client.upsert(COLLECTION, { wait: true, points: docs });
  console.log("Chunks inserted");
}

async function searchChunks(embedding, limit = 8) {
  const results = await client.search(COLLECTION, { vector: embedding, limit });
  return results;
}

// NEW: metadata-only fetch — koi vector search nahi, seedha type filter + sort
async function fetchByType(type, sortField = "order", order = "asc") {
  const result = await client.scroll(COLLECTION, {
    filter: { must: [{ key: "type", match: { value: type } }] },
    limit: 100,
    with_payload: true,
  });

  const points = result.points;

  points.sort((a, b) => {
    const av = a.payload[sortField] ?? 0;
    const bv = b.payload[sortField] ?? 0;
    return order === "asc" ? av - bv : bv - av;
  });

  return points;
}

// NEW: sab chunks fetch karo (small-corpus fallback ke liye)
async function fetchAllChunks() {
  const result = await client.scroll(COLLECTION, { limit: 1000, with_payload: true });
  return result.points;
}

module.exports = {
  client,
  COLLECTION,
  createCollection,
  insertChunks,
  searchChunks,
  fetchByType,
  fetchAllChunks,
};
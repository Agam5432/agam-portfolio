const {
  getEmbedding,
} = require(
  "../services/embeddings"
);

const {
  searchChunks,
} = require(
  "../services/vectorStore"
);

(async () => {
  const question =
    "What technologies does Agam know?";

  const embedding =
    await getEmbedding(
      question
    );

  const results =
    await searchChunks(
      embedding
    );

  console.log(
    JSON.stringify(
      results,
      null,
      2
    )
  );
})();
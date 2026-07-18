const {
  retrieve,
} = require(
  "../services/rag"
);

const {
  askLLM,
} = require(
  "../services/chat"
);

(async () => {
  const question =
    "What technologies does Agam know?";

  const context =
    await retrieve(
      question
    );

  const answer =
    await askLLM(
      question,
      context
    );

  console.log(
    "\nAnswer:\n"
  );

  console.log(answer);
})();
const {
  retrieve,
} = require(
  "../services/rag"
);

(async () => {
  const context =
    await retrieve(
      "What technologies does Agam know?"
    );

  console.log(
    "Retrieved Context:\n"
  );

  console.log(
    context
  );
})();
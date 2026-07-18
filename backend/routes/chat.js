const express = require("express");
const router = express.Router();

const { retrieve } = require("../services/rag");
const { askLLM } = require("../services/chat");

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
     if (
      !message ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message is required",
      });
    }
    const context = await retrieve(message);
    const answer =
      await askLLM(
        message,
        context
      );

    res.json({
      success: true,
      answer,
      context,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message:
        "Something went wrong",
    });
  }
});

module.exports = router;
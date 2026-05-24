const express = require("express");
const router = express.Router();

// TEMP in-memory comments (for testing)
let comments = [];

// GET all comments
router.get("/", (req, res) => {
  res.json(comments);
});

// POST comment
router.post("/", (req, res) => {
  const { text, user } = req.body;

  const newComment = {
    id: Date.now(),
    text,
    user
  };

  comments.push(newComment);

  res.json(newComment);
});

module.exports = router;
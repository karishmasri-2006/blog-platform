import express from "express";
const router = express.Router();

// In-memory storage - no database needed
let comments = [];

router.get("/", (req, res) => {
  res.json(comments);
});

router.post("/", (req, res) => {
  const { text, user } = req.body;
  
  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  const newComment = {
    id: Date.now().toString(),
    text,
    user: user || "Anonymous",
    createdAt: new Date()
  };

  comments.push(newComment);
  res.status(201).json(newComment);
});

export default router;
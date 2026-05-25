const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Add comment
router.post('/', auth, async (req, res) => {
  const { content, postId } = req.body;
  const comment = await prisma.comment.create({
    data: { content, postId, authorId: req.userId }
  });
  res.json(comment);
});

module.exports = router;
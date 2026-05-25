const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Auth middleware
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

// ADD comment - any logged in user
router.post('/', auth, async (req, res) => {
  try {
    const { content, postId } = req.body;
    if (!content ||!postId) {
      return res.status(400).json({ message: 'Content and postId required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.userId
      },
      include: { author: { select: { name: true } } }
    });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add comment' });
  }
});

module.exports = router;
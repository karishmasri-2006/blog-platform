const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Create comment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, postId } = req.body;
    const comment = await prisma.comment.create({
      data: { 
        content, 
        postId: parseInt(postId), 
        authorId: req.user.id 
      },
      include: { author: { select: { name: true } } }
    });
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create comment' });
  }
});

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(req.params.postId) },
      include: { author: { select: { name: true } } }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
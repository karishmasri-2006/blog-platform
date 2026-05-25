const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Middleware to check token
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all published posts
router.get('/', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: { select: { name: true, id: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(posts);
});

// Get single post with comments
router.get('/:id', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { name: true, id: true } },
      comments: { include: { author: { select: { name: true } } } }
    }
  });
  res.json(post);
});

// Create post
router.post('/', auth, async (req, res) => {
  const { title, content, published } = req.body;
  const post = await prisma.post.create({
    data: { title, content, published, authorId: req.userId }
  });
  res.json(post);
});

// Update post - only owner
router.put('/:id', auth, async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (post.authorId!== req.userId) return res.status(403).json({ message: 'Not yours' });

  const updated = await prisma.post.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(updated);
});

// Delete post - only owner
router.delete('/:id', auth, async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (post.authorId!== req.userId) return res.status(403).json({ message: 'Not yours' });

  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

module.exports = router;
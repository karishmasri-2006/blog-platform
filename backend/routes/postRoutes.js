const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');

// GET /api/posts - Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts - Create new post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, email: true } }
      }
    });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/posts/:id - Get single post + comments
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: { select: { id: true, email: true } }
      }
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(req.params.id) },
      include: {
        author: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ post, comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id - Edit post - author only
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title: req.body.title || post.title,
        content: req.body.content || post.content
      }
    });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/posts/:id - Delete post - author only
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await prisma.post.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/comments - Add comment
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const newComment = await prisma.comment.create({
      data: {
        content: req.body.content,
        postId: parseInt(req.params.id),
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, email: true } }
      }
    });
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
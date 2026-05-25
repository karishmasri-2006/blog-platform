const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const protect = require('../middleware/auth')

const prisma = new PrismaClient()

// GET ALL POSTS - WITH COMMENTS COUNT
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET SINGLE POST
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// CREATE POST
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, published } = req.body
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, name: true } }
      }
    })
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// UPDATE POST
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) }
    })

    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.authorId!== req.user.id) return res.status(401).json({ message: 'Not authorized' })

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        author: { select: { id: true, name: true } }
      }
    })
    res.json(updatedPost)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE POST
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) }
    })

    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.authorId!== req.user.id) return res.status(401).json({ message: 'Not authorized' })

    await prisma.post.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.json({ message: 'Post deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
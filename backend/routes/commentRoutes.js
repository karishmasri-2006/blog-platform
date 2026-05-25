const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const protect = require('../middleware/auth')

const prisma = new PrismaClient()

// POST COMMENT
router.post('/', protect, async (req, res) => {
  try {
    const { content, postId } = req.body

    if (!req.user ||!req.user.id) {
      return res.status(401).json({ message: 'User not found in token' })
    }

    if (!content ||!postId) {
      return res.status(400).json({ message: 'Content and postId required' })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId: req.user.id
      },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    })
    res.status(201).json(comment)
  } catch (error) {
    console.log('Comment error:', error)
    res.status(500).json({ message: error.message })
  }
})

// DELETE COMMENT
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(req.params.id) }
    })

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    if (comment.authorId!== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' })
    }

    await prisma.comment.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.log('Delete comment error:', error)
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
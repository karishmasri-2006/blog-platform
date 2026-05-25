const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const Comment = require('../models/Comment')
const router = express.Router()

// POST comment
router.post('/', protect, async (req, res) => {
  try {
    const { content, postId } = req.body
    const comment = await Comment.create({
      content,
      post: postId,
      author: req.user._id
    })
    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE COMMENT - ADD THIS
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' })
    }
    
    await Comment.findByIdAndDelete(req.params.id)
    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
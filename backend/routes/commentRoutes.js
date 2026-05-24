import express from "express"
import prisma from "../prismaClient.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/:postId", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body

    const comment = await prisma.comment.create({
      data: {
        text,
        userId: req.user.id,
        postId: req.params.postId,
      },
    })

    res.json({
      message: "Comment added",
      comment,
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: "Server error",
    })
  }
})

export default router
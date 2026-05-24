import express from "express"
import prisma from "../prismaClient.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// ✅ GET ALL POSTS (Home page)
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json(posts)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" })
  }
})

// ✅ GET SINGLE POST (IMPORTANT FOR COMMENTS PAGE)
router.get("/:id", async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        author: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    res.json(post)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" })
  }
})

// ✅ CREATE POST
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: req.user.id,
      },
    })

    res.json({ message: "Post created", post })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" })
  }
})

// ✅ UPDATE POST (OWNER ONLY)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body

    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    })

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: { title, content },
    })

    res.json({ message: "Updated", updated })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" })
  }
})

// ✅ DELETE POST (OWNER ONLY)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    })

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    // delete comments first
    await prisma.comment.deleteMany({
      where: { postId: req.params.id },
    })

    await prisma.post.delete({
      where: { id: req.params.id },
    })

    res.json({ message: "Deleted" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

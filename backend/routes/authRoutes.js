const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const protect = async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Handle both 'id' and 'userId' from JWT payload
      const userId = decoded.id || decoded.userId

      if (!userId) {
        return res.status(401).json({ message: 'Invalid token payload' })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true }
      })

      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }

      req.user = user
      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

module.exports = protect
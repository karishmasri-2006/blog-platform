const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const protect = require('../middleware/auth')

const prisma = new PrismaClient()

// REGISTER - NO PROTECT MIDDLEWARE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name ||!email ||!password) {
      return res.status(400).json({ message: 'Please enter all fields' })
    }

    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    })

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
})

// LOGIN - NO PROTECT MIDDLEWARE  
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    })

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET USER PROFILE - USES PROTECT
router.get('/profile', protect, async (req, res) => {
  res.json(req.user)
})

module.exports = router
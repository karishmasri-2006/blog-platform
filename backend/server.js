import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 10000

// CORS - allows your frontend to talk to backend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://blog-platform-f7yo.onrender.com'
  ],
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Blog API is running!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
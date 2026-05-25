const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load env variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes'); // your existing auth routes
const postRoutes = require('./routes/postRoutes'); // ← NEW: the file we just made

// Init app
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.vercel.app'], // ← CHANGE: add your Vercel frontend URL
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Blog API is running!' });
});

// Routes
app.use('/api/auth', authRoutes); // ← Your existing login/register routes
app.use('/api/posts', postRoutes); // ← NEW: CRUD for posts + comments

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server running on port ${PORT}`);
    console.log('Database connected');
  } catch (err) {
    console.error('DB connection failed:', err);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // <-- CHANGED FROM ./routes/auth

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Blog Platform API Running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
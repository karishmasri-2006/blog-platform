const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: ["https://blog-platform-f7yo.onrender.com", "http://localhost:5173"]
}));
app.use(express.json());

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes - ADD THESE 2 LINES
const postRoutes = require("./routes/posts"); // if you have posts
const commentRoutes = require("./routes/commentRoutes"); // NEW
app.use("/api/posts", postRoutes); // if you have posts  
app.use("/api/comments", commentRoutes); // NEW

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
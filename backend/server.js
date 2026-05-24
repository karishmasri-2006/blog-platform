const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(cors({
  origin: "*", // later you can lock it to frontend URL
}));
app.use(express.json());

// routes
const commentRoutes = require("./routes/commentRoutes");
app.use("/api/comments", commentRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
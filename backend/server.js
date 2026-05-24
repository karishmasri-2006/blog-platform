import express from "express";
import cors from "cors";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();

app.use(cors({
  origin: ["https://blog-platform-f7yo.onrender.com", "http://localhost:5173"]
}));
app.use(express.json());

// Routes
app.use("/api/comments", commentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
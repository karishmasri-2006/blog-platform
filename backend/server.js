import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import commentRoutes from "./routes/commentRoutes.js"; // Note the .js extension

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://blog-platform-f7yo.onrender.com", "http://localhost:5173"]
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
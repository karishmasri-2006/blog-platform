import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors({ 
  origin: ["https://blog-platform-f7yo.onrender.com", "http://localhost:5173"] 
}));

app.use(express.json());

// Root check
app.get("/", (req, res) => {
  res.send("Blog API is running");
});

// Comments - already working
app.use("/api/comments", commentRoutes);

// Posts - stops the 404
app.get("/api/posts", async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Register - ADD THIS TO FIX REGISTER BUTTON
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword 
      }
    });
    
    const { password: _, ...userSafe } = user;
    res.status(201).json({ 
      message: "User created", 
      user: userSafe 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login - fixes login button
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    
    const { password: _, ...userSafe } = user;
    
    res.json({ 
      message: "Login success", 
      user: userSafe 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
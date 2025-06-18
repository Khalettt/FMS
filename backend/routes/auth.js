const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// --- BigInt Serializer ---
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// --- Multer Config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const isValid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    isValid ? cb(null, true) : cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed."));
  },
});

// --- Middleware: JWT Auth ---
const authenticateToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token or invalid format." });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = BigInt(decoded.userId);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// --- Signup Route ---
router.post("/signup", upload.single("imagePhoto"), async (req, res) => {
  try {
    const { fullname, username, email, password, phone, address } = req.body;
    const imagePhoto = req.file?.filename;

    if (!fullname || !username || !email || !password || !imagePhoto) {
      return res.status(400).json({ error: "All fields are required including profile image." });
    }

    const exists = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (exists) {
      return res.status(400).json({ error: "Username or Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

          const user = await prisma.user.create({
      data: {
        fullname,
        username,
        email,
        password: hashedPassword,
        image_photo: imagePhoto,
        phone: phone || null,    // Store phone (can be null if not provided)
        address: address || null, // Store address (can be null if not provided)
      },
    });

    res.status(201).json({ message: "User created.", user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Login Route ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const token = jwt.sign({ userId: user.id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, userId: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Get Current User ---
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        image_photo: true,
        created_at: true,
        phone: true ,
        address: true
      },
    });

    if (!user) return res.status(404).json({ error: "User not found." });

    res.json(user);
  } catch (err) {
    console.error("Get /me error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Update Profile ---
router.put("/update-profile/:id", authenticateToken, upload.single("imagePhoto"), async (req, res) => {
  try {
    const userId = BigInt(req.params.id);
    if (req.userId !== userId) return res.status(403).json({ error: "Unauthorized." });

    const { fullname, username, email, phone, address } = req.body;
    const imagePhoto = req.file?.filename;

    // Check unique username/email
    const usernameUsed = await prisma.user.findFirst({ where: { username, NOT: { id: userId } } });
    const emailUsed = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
    if (usernameUsed) return res.status(400).json({ error: "Username already taken." });
    if (emailUsed) return res.status(400).json({ error: "Email already taken." });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullname: fullname || undefined,
        username: username || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        image_photo: imagePhoto || undefined,
        phone: phone || null,    // Store phone (can be null if not provided)
        address: address || null,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        image_photo: true,
        created_at: true,
        phone: true ,
        address: true
      },
    });

    res.json({ message: "Profile updated.", user: updated });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Change Password ---
router.put("/change-password/:id", authenticateToken, async (req, res) => {
  try {
    const userId = BigInt(req.params.id);
    if (req.userId !== userId) return res.status(403).json({ error: "Unauthorized." });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords are required." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: "Incorrect current password." });
    }

    const newHashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({ where: { id: userId }, data: { password: newHashed } });

    res.json({ message: "Password changed." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;

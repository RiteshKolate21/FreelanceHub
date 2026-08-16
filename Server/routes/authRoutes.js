import express from "express";

import {
  registerUser,
  loginUser
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get currently authenticated user
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Authentication successful",
    user: req.user
  });
});

export default router;
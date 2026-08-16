import express from "express";
import {
  createReview,
  getFreelancerReviews,
  getProjectReview
} from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Client submits review for completed project
router.post("/", authMiddleware, authorizeRoles("Client"), createReview);

// Get reviews for a freelancer
router.get("/freelancer/:freelancerId", authMiddleware, getFreelancerReviews);

// Get review for a project
router.get("/project/:projectId", authMiddleware, getProjectReview);

export default router;

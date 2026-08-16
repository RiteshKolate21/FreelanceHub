import express from "express";
import {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  getAdminProjects,
  deleteAdminProject,
  getAdminApplications,
  getAdminReviews,
  deleteAdminReview
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth and admin authorization to all routes
router.use(authMiddleware, authorizeRoles("Admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.patch("/users/:userId/status", toggleUserStatus);

router.get("/projects", getAdminProjects);
router.delete("/projects/:projectId", deleteAdminProject);

router.get("/applications", getAdminApplications);

router.get("/reviews", getAdminReviews);
router.delete("/reviews/:reviewId", deleteAdminReview);

export default router;

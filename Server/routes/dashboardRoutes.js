import express from "express";
import {
  getFreelancerDashboard,
  getClientDashboard
} from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/freelancer",
  authMiddleware,
  authorizeRoles("Freelancer"),
  getFreelancerDashboard
);

router.get(
  "/client",
  authMiddleware,
  authorizeRoles("Client"),
  getClientDashboard
);

export default router;

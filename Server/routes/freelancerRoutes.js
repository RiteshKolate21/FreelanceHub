import express from "express";

import {
    createFreelancerProfile,
    getFreelancerProfile,
    updateFreelancerProfile,
    getAllFreelancers
} from "../controllers/freelancerController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();


// Get all freelancers
router.get(
    "/",
    authMiddleware,
    getAllFreelancers
);


// Freelancer creates their profile
router.post(
    "/",
    authMiddleware,
    authorizeRoles("Freelancer"),
    createFreelancerProfile
);


// View freelancer profile
router.get(
    "/:userId",
    authMiddleware,
    getFreelancerProfile
);


// Freelancer updates their own profile
router.put(
    "/",
    authMiddleware,
    authorizeRoles("Freelancer"),
    updateFreelancerProfile
);


export default router;
import express from "express";

import {
    createApplication,
    getProjectApplications,
    updateApplicationStatus
} from "../controllers/applicationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Freelancer submits application
router.post(
    "/",
    authMiddleware,
    authorizeRoles("Freelancer"),
    createApplication
);

// Client views applications for a project
router.get(
    "/project/:projectId",
    authMiddleware,
    authorizeRoles("Client"),
    getProjectApplications
);

// Client approves or rejects application
router.patch(
    "/:applicationId/status",
    authMiddleware,
    authorizeRoles("Client"),
    updateApplicationStatus
);

export default router;
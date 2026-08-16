import express from "express";
import {
    createApplication,
    getProjectApplications,
    updateApplicationStatus,
    getMyApplications,
    getClientReceivedApplications,
    getApplicationById
} from "../controllers/applicationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Freelancer views own applications
router.get(
    "/my-applications",
    authMiddleware,
    authorizeRoles("Freelancer"),
    getMyApplications
);

// Client views received applications across projects
router.get(
    "/client-received",
    authMiddleware,
    authorizeRoles("Client"),
    getClientReceivedApplications
);

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
    authorizeRoles("Client", "Admin"),
    getProjectApplications
);

// Get single application details
router.get(
    "/:applicationId",
    authMiddleware,
    getApplicationById
);

// Client approves or rejects application
router.patch(
    "/:applicationId/status",
    authMiddleware,
    authorizeRoles("Client"),
    updateApplicationStatus
);

export default router;
import express from "express";

import {
    createProject,
    getAllProjects,
    getProjectById,
    submitProject,
    completeProject
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();
// Get all projects
router.get(
    "/",
    authMiddleware,
    getAllProjects
);

// Get single project
router.get(
    "/:id",
    authMiddleware,
    getProjectById
);

// Client creates a project
router.post(
    "/",
    authMiddleware,
    authorizeRoles("Client"),
    createProject
);

// Freelancer submits completed project
router.patch(
    "/:projectId/submit",
    authMiddleware,
    authorizeRoles("Freelancer"),
    submitProject
);

// Client completes submitted project
router.patch(
    "/:projectId/complete",
    authMiddleware,
    authorizeRoles("Client"),
    completeProject
);


export default router;
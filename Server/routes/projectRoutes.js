import express from "express";

import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    submitProject,
    completeProject
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();


// Get all open projects
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


// Client updates project
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("Client"),
    updateProject
);


// Client deletes project
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("Client"),
    deleteProject
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
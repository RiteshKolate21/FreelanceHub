import express from "express";

import {
    createProject,
    getAllProjects,
    getProjectById
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
export default router;
import express from "express";

import {
    sendMessage,
    getProjectMessages
} from "../controllers/chatController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Send a message
router.post(
    "/",
    authMiddleware,
    sendMessage
);

// Get all messages for a project
router.get(
    "/:projectId",
    authMiddleware,
    getProjectMessages
);

export default router;
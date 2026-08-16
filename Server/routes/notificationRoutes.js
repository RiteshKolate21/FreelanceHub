import express from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getUnreadCount
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.patch("/:id/read", authMiddleware, markNotificationAsRead);
router.patch("/read-all", authMiddleware, markAllAsRead);

export default router;

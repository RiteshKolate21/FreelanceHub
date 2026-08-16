import Notification from "../models/Notification.js";
import mongoose from "mongoose";

// Helper function to create notification programmatically
export const createNotificationInternal = async ({
  recipientId,
  type,
  title,
  message,
  relatedProjectId = null,
  relatedApplicationId = null
}) => {
  try {
    if (!recipientId) return;
    await Notification.create({
      recipientId,
      type,
      title,
      message,
      relatedProjectId,
      relatedApplicationId
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Get current user's notifications
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.userId
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.userId,
      isRead: false
    });

    res.status(200).json({
      message: "Notifications fetched successfully",
      unreadCount,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};

// Mark single notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findOne({
      _id: id,
      recipientId: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update notification",
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      message: "All notifications marked as read"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notifications as read",
      error: error.message
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.userId,
      isRead: false
    });

    res.status(200).json({
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch unread count",
      error: error.message
    });
  }
};

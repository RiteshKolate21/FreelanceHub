import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "APPLICATION_RECEIVED",
        "APPLICATION_APPROVED",
        "APPLICATION_REJECTED",
        "FREELANCER_ASSIGNED",
        "PROJECT_SUBMITTED",
        "PROJECT_COMPLETED",
        "NEW_CHAT_MESSAGE"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    relatedProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null
    },

    relatedApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    proposal: {
      type: String,
      required: true
    },

    bidAmount: {
      type: Number,
      required: true
    },

    estimatedTime: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

export default Application;
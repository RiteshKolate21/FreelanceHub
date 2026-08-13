import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    budget: {
      type: Number,
      required: true
    },

    skills: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Submitted", "Completed", "Cancelled"],
      default: "Open"
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deadline: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
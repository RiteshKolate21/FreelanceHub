import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    skills: {
      type: [String],
      default: []
    },

    experience: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },

    rating: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Freelancer = mongoose.model("Freelancer", freelancerSchema);

export default Freelancer;
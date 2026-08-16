import Review from "../models/Review.js";
import Project from "../models/Project.js";
import Freelancer from "../models/Freelancer.js";
import { createNotificationInternal } from "./notificationController.js";
import mongoose from "mongoose";

// Create review for a completed project
export const createReview = async (req, res) => {
  try {
    const { projectId, rating, comment } = req.body;

    if (!projectId || !rating || !comment) {
      return res.status(400).json({
        message: "projectId, rating and comment are required"
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5"
      });
    }

    if (!comment.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty"
      });
    }

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Only project client can submit review
    if (project.clientId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only the client of this project can submit a review"
      });
    }

    // Project must be completed
    if (project.status !== "Completed") {
      return res.status(400).json({
        message: "Only completed projects can be reviewed"
      });
    }

    if (!project.freelancerId) {
      return res.status(400).json({
        message: "No assigned freelancer found for this project"
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ projectId });
    if (existingReview) {
      return res.status(400).json({
        message: "Review already submitted for this project"
      });
    }

    // Create review
    const review = await Review.create({
      projectId,
      clientId: req.user.userId,
      freelancerId: project.freelancerId,
      rating: numericRating,
      comment: comment.trim()
    });

    // Recalculate freelancer average rating
    const allFreelancerReviews = await Review.find({
      freelancerId: project.freelancerId
    });

    const totalRatings = allFreelancerReviews.reduce(
      (acc, r) => acc + r.rating,
      0
    );
    const avgRating = totalRatings / allFreelancerReviews.length;
    const roundedAvg = Math.round(avgRating * 10) / 10;

    await Freelancer.findOneAndUpdate(
      { userId: project.freelancerId },
      { rating: roundedAvg }
    );

    // Notify freelancer about review
    await createNotificationInternal({
      recipientId: project.freelancerId,
      type: "PROJECT_COMPLETED",
      title: "New Review Received",
      message: `The client left a ${numericRating}-star review for project "${project.title}".`,
      relatedProjectId: project._id
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review,
      freelancerAverageRating: roundedAvg
    });

  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      message: "Failed to submit review",
      error: error.message
    });
  }
};

// Get reviews for a specific freelancer
export const getFreelancerReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
      return res.status(400).json({ message: "Invalid freelancer ID" });
    }

    const reviews = await Review.find({ freelancerId })
      .populate("clientId", "username email")
      .populate("projectId", "title budget")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
          ) / 10
        : 0;

    res.status(200).json({
      message: "Reviews fetched successfully",
      count: totalReviews,
      averageRating: avgRating,
      reviews
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// Get review for a specific project
export const getProjectReview = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const review = await Review.findOne({ projectId })
      .populate("clientId", "username email")
      .populate("freelancerId", "username email");

    res.status(200).json({
      message: "Project review fetched successfully",
      review: review || null
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project review",
      error: error.message
    });
  }
};

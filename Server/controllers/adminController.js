import User from "../models/User.js";
import Project from "../models/Project.js";
import Application from "../models/Application.js";
import Review from "../models/Review.js";
import Freelancer from "../models/Freelancer.js";
import mongoose from "mongoose";

// Platform overview statistics
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const clientsCount = await User.countDocuments({ userType: "Client" });
    const freelancersCount = await User.countDocuments({ userType: "Freelancer" });
    const adminsCount = await User.countDocuments({ userType: "Admin" });

    const totalProjects = await Project.countDocuments();
    const openProjects = await Project.countDocuments({ status: "Open" });
    const inProgressProjects = await Project.countDocuments({ status: "In Progress" });
    const submittedProjects = await Project.countDocuments({ status: "Submitted" });
    const completedProjects = await Project.countDocuments({ status: "Completed" });

    const totalApplications = await Application.countDocuments();
    const pendingApps = await Application.countDocuments({ status: "Pending" });
    const approvedApps = await Application.countDocuments({ status: "Approved" });
    const rejectedApps = await Application.countDocuments({ status: "Rejected" });

    const totalReviews = await Review.countDocuments();

    res.status(200).json({
      message: "Admin statistics fetched successfully",
      stats: {
        users: {
          total: totalUsers,
          clients: clientsCount,
          freelancers: freelancersCount,
          admins: adminsCount
        },
        projects: {
          total: totalProjects,
          open: openProjects,
          inProgress: inProgressProjects,
          submitted: submittedProjects,
          completed: completedProjects
        },
        applications: {
          total: totalApplications,
          pending: pendingApps,
          approved: approvedApps,
          rejected: rejectedApps
        },
        reviews: {
          total: totalReviews
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin stats",
      error: error.message
    });
  }
};

// View all users
export const getAdminUsers = async (req, res) => {
  try {
    const { userType, search } = req.query;
    const filter = {};

    if (userType && ["Client", "Freelancer", "Admin"].includes(userType)) {
      filter.userType = userType;
    }

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// Disable or enable a user account
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userType === "Admin") {
      return res.status(400).json({ message: "Admin users cannot be disabled" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        isBlocked: user.isBlocked
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update user status",
      error: error.message
    });
  }
};

// View all projects
export const getAdminProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const projects = await Project.find(filter)
      .populate("clientId", "username email")
      .populate("freelancerId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Projects fetched successfully",
      count: projects.length,
      projects
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message
    });
  }
};

// Delete project (Admin moderation)
export const deleteAdminProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Project.findByIdAndDelete(projectId);

    // Also remove applications related to project
    await Application.deleteMany({ projectId });

    res.status(200).json({
      message: "Project and associated applications removed by admin"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete project",
      error: error.message
    });
  }
};

// View all applications
export const getAdminApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate("freelancerId", "username email")
      .populate({
        path: "projectId",
        select: "title budget status clientId",
        populate: { path: "clientId", select: "username email" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Applications fetched successfully",
      count: applications.length,
      applications
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};

// View all reviews
export const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("clientId", "username email")
      .populate("freelancerId", "username email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reviews fetched successfully",
      count: reviews.length,
      reviews
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// Delete review (Admin moderation)
export const deleteAdminReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const freelancerId = review.freelancerId;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate average rating for freelancer
    const remainingReviews = await Review.find({ freelancerId });
    const roundedAvg =
      remainingReviews.length > 0
        ? Math.round(
            (remainingReviews.reduce((acc, r) => acc + r.rating, 0) /
              remainingReviews.length) *
              10
          ) / 10
        : 0;

    await Freelancer.findOneAndUpdate({ userId: freelancerId }, { rating: roundedAvg });

    res.status(200).json({
      message: "Review removed by admin",
      updatedAverageRating: roundedAvg
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message
    });
  }
};

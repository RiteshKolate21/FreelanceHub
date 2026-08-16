import Freelancer from "../models/Freelancer.js";
import Application from "../models/Application.js";
import Project from "../models/Project.js";
import Review from "../models/Review.js";

// FREELANCER DASHBOARD
export const getFreelancerDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Profile
    const profile = await Freelancer.findOne({ userId }).populate(
      "userId",
      "username email"
    );

    // 2. Applications
    const applications = await Application.find({ freelancerId: userId })
      .populate({
        path: "projectId",
        populate: { path: "clientId", select: "username email" }
      })
      .sort({ createdAt: -1 });

    const pendingApplications = applications.filter(a => a.status === "Pending");
    const approvedApplications = applications.filter(a => a.status === "Approved");
    const rejectedApplications = applications.filter(a => a.status === "Rejected");

    // 3. Projects assigned to freelancer
    const assignedProjects = await Project.find({ freelancerId: userId })
      .populate("clientId", "username email")
      .sort({ updatedAt: -1 });

    const inProgressProjects = assignedProjects.filter(p => p.status === "In Progress");
    const submittedProjects = assignedProjects.filter(p => p.status === "Submitted");
    const completedProjects = assignedProjects.filter(p => p.status === "Completed");

    // 4. Received Reviews
    const reviews = await Review.find({ freelancerId: userId })
      .populate("clientId", "username email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    // 5. Total earnings estimate
    const totalEarnings = completedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

    res.status(200).json({
      message: "Freelancer dashboard fetched successfully",
      profile,
      metrics: {
        totalApplications: applications.length,
        pendingApplicationsCount: pendingApplications.length,
        approvedApplicationsCount: approvedApplications.length,
        rejectedApplicationsCount: rejectedApplications.length,
        assignedProjectsCount: assignedProjects.length,
        inProgressProjectsCount: inProgressProjects.length,
        submittedProjectsCount: submittedProjects.length,
        completedProjectsCount: completedProjects.length,
        totalEarnings,
        averageRating: profile ? profile.rating : 0,
        reviewsCount: reviews.length
      },
      applications: {
        all: applications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications
      },
      projects: {
        all: assignedProjects,
        inProgress: inProgressProjects,
        submitted: submittedProjects,
        completed: completedProjects
      },
      reviews
    });

  } catch (error) {
    console.error("Freelancer dashboard error:", error);
    res.status(500).json({
      message: "Failed to fetch freelancer dashboard data",
      error: error.message
    });
  }
};

// CLIENT DASHBOARD
export const getClientDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Client Projects
    const projects = await Project.find({ clientId: userId })
      .populate("freelancerId", "username email")
      .sort({ createdAt: -1 });

    const openProjects = projects.filter(p => p.status === "Open");
    const inProgressProjects = projects.filter(p => p.status === "In Progress");
    const submittedProjects = projects.filter(p => p.status === "Submitted");
    const completedProjects = projects.filter(p => p.status === "Completed");

    const projectIds = projects.map(p => p._id);

    // 2. Applications received for client's projects
    const applications = await Application.find({ projectId: { $in: projectIds } })
      .populate("freelancerId", "username email")
      .populate("projectId", "title budget status")
      .sort({ createdAt: -1 });

    // Group projects with application count
    const projectsWithAppCount = projects.map(proj => {
      const appCount = applications.filter(a => a.projectId && a.projectId._id.toString() === proj._id.toString()).length;
      return {
        ...proj.toObject(),
        applicationCount: appCount
      };
    });

    // Projects that currently have applications
    const projectsWithApplications = projectsWithAppCount.filter(p => p.applicationCount > 0);

    // 3. Assigned Freelancers details
    const assignedFreelancerIds = Array.from(
      new Set(
        projects
          .filter(p => p.freelancerId)
          .map(p => p.freelancerId._id.toString())
      )
    );

    const assignedFreelancers = await Freelancer.find({
      userId: { $in: assignedFreelancerIds }
    }).populate("userId", "username email");

    res.status(200).json({
      message: "Client dashboard fetched successfully",
      metrics: {
        totalProjects: projects.length,
        openProjectsCount: openProjects.length,
        inProgressProjectsCount: inProgressProjects.length,
        submittedProjectsCount: submittedProjects.length,
        completedProjectsCount: completedProjects.length,
        totalApplicationsReceived: applications.length,
        assignedFreelancersCount: assignedFreelancers.length
      },
      projects: {
        all: projectsWithAppCount,
        open: openProjects,
        withApplications: projectsWithApplications,
        inProgress: inProgressProjects,
        submitted: submittedProjects,
        completed: completedProjects
      },
      applicationsReceived: applications,
      assignedFreelancers
    });

  } catch (error) {
    console.error("Client dashboard error:", error);
    res.status(500).json({
      message: "Failed to fetch client dashboard data",
      error: error.message
    });
  }
};

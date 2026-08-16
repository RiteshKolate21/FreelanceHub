import Application from "../models/Application.js";
import Project from "../models/Project.js";
import { createNotificationInternal } from "./notificationController.js";
import mongoose from "mongoose";

// Freelancer creates application
export const createApplication = async (req, res) => {
    try {
        const {
            projectId,
            proposal,
            bidAmount,
            estimatedTime
        } = req.body;

        // Validate required fields
        if (
            !projectId ||
            !proposal ||
            !bidAmount ||
            !estimatedTime
        ) {
            return res.status(400).json({
                message:
                    "Project ID, proposal, bid amount and estimated time are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const numericBid = Number(bidAmount);
        const numericTime = Number(estimatedTime);

        if (isNaN(numericBid) || numericBid <= 0) {
            return res.status(400).json({ message: "Bid amount must be a positive number" });
        }

        if (isNaN(numericTime) || numericTime <= 0) {
            return res.status(400).json({ message: "Estimated time must be a positive number" });
        }

        // Check if project exists
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Check project status
        if (project.status !== "Open") {
            return res.status(400).json({
                message: "Applications are closed for this project"
            });
        }

        // Prevent client from applying to their own project
        if (project.clientId.toString() === req.user.userId) {
            return res.status(400).json({
                message: "You cannot apply to your own project"
            });
        }

        // Prevent duplicate application
        const existingApplication = await Application.findOne({
            projectId,
            freelancerId: req.user.userId
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied to this project"
            });
        }

        // Create application
        const application = await Application.create({
            projectId,
            freelancerId: req.user.userId,
            proposal: proposal.trim(),
            bidAmount: numericBid,
            estimatedTime: numericTime,
            status: "Pending"
        });

        // Notify Project Client
        await createNotificationInternal({
            recipientId: project.clientId,
            type: "APPLICATION_RECEIVED",
            title: "New Application Received",
            message: `${req.user.username || "A freelancer"} applied to your project "${project.title}".`,
            relatedProjectId: project._id,
            relatedApplicationId: application._id
        });

        res.status(201).json({
            message: "Application submitted successfully",
            application
        });

    } catch (error) {
        console.error("Create application error:", error);

        res.status(500).json({
            message: "Failed to submit application",
            error: error.message
        });
    }
};

// Client views applications for a specific project
export const getProjectApplications = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.query;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        // Check if project exists
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only the project owner or Admin can view applications
        if (project.clientId.toString() !== req.user.userId && req.user.userType !== "Admin") {
            return res.status(403).json({
                message: "You are not authorized to view these applications"
            });
        }

        const filter = { projectId };
        if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
            filter.status = status;
        }

        const applications = await Application.find(filter)
            .populate("freelancerId", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Applications fetched successfully",
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error("Get applications error:", error);

        res.status(500).json({
            message: "Failed to fetch applications",
            error: error.message
        });
    }
};

// Freelancer views own applications
export const getMyApplications = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { freelancerId: req.user.userId };

        if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
            filter.status = status;
        }

        const applications = await Application.find(filter)
            .populate({
                path: "projectId",
                populate: { path: "clientId", select: "username email" }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "My applications fetched successfully",
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

// Client views all applications received across projects
export const getClientReceivedApplications = async (req, res) => {
    try {
        const { status } = req.query;

        // Get all client project IDs
        const clientProjects = await Project.find({ clientId: req.user.userId }).select("_id");
        const projectIds = clientProjects.map(p => p._id);

        const filter = { projectId: { $in: projectIds } };
        if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
            filter.status = status;
        }

        const applications = await Application.find(filter)
            .populate("freelancerId", "username email")
            .populate("projectId", "title budget status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Received applications fetched successfully",
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch received applications",
            error: error.message
        });
    }
};

// Get single application details
export const getApplicationById = async (req, res) => {
    try {
        const { applicationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const application = await Application.findById(applicationId)
            .populate("freelancerId", "username email")
            .populate({
                path: "projectId",
                populate: { path: "clientId", select: "username email" }
            });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const isApplicant = application.freelancerId._id.toString() === req.user.userId;
        const isClient = application.projectId.clientId._id.toString() === req.user.userId;
        const isAdmin = req.user.userType === "Admin";

        if (!isApplicant && !isClient && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to view this application" });
        }

        res.status(200).json({
            message: "Application fetched successfully",
            application
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch application details",
            error: error.message
        });
    }
};

// Client approves or rejects application
export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        // Validate status
        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be Approved or Rejected"
            });
        }

        // Find application
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        // Find related project
        const project = await Project.findById(application.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only project owner can approve/reject
        if (project.clientId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not authorized to update this application"
            });
        }

        // Prevent changing an already processed application
        if (application.status !== "Pending") {
            return res.status(400).json({
                message: "Application has already been processed"
            });
        }

        // Update application status
        application.status = status;
        await application.save();

        // If approved, assign freelancer to project
        if (status === "Approved") {
            project.freelancerId = application.freelancerId;
            project.status = "In Progress";

            await project.save();

            // Notify approved freelancer
            await createNotificationInternal({
                recipientId: application.freelancerId,
                type: "APPLICATION_APPROVED",
                title: "Application Approved!",
                message: `Your application for "${project.title}" has been approved. You are now assigned to this project.`,
                relatedProjectId: project._id,
                relatedApplicationId: application._id
            });

            // Reject other pending applications & notify them
            const otherPendingApps = await Application.find({
                projectId: project._id,
                _id: { $ne: application._id },
                status: "Pending"
            });

            await Application.updateMany(
                {
                    projectId: project._id,
                    _id: { $ne: application._id },
                    status: "Pending"
                },
                {
                    $set: { status: "Rejected" }
                }
            );

            for (const otherApp of otherPendingApps) {
                await createNotificationInternal({
                    recipientId: otherApp.freelancerId,
                    type: "APPLICATION_REJECTED",
                    title: "Application Status Update",
                    message: `Another application was selected for project "${project.title}".`,
                    relatedProjectId: project._id,
                    relatedApplicationId: otherApp._id
                });
            }
        } else if (status === "Rejected") {
            // Notify rejected freelancer
            await createNotificationInternal({
                recipientId: application.freelancerId,
                type: "APPLICATION_REJECTED",
                title: "Application Status Update",
                message: `Your application for "${project.title}" was not selected.`,
                relatedProjectId: project._id,
                relatedApplicationId: application._id
            });
        }

        res.status(200).json({
            message: `Application ${status.toLowerCase()} successfully`,
            application,
            project
        });

    } catch (error) {
        console.error("Update application status error:", error);

        res.status(500).json({
            message: "Failed to update application status",
            error: error.message
        });
    }
};
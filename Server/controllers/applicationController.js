import Application from "../models/Application.js";
import Project from "../models/Project.js";

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
            proposal,
            bidAmount,
            estimatedTime,
            status: "Pending"
        });

        res.status(201).json({
            message: "Application submitted successfully",
            application
        });

    } catch (error) {
        console.error("Create application error:", error);

        res.status(500).json({
            message: "Failed to submit application"
        });
    }
};


export const getProjectApplications = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Check if project exists
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only the project owner can view applications
        if (project.clientId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not authorized to view these applications"
            });
        }

        const applications = await Application.find({
            projectId
        }).populate(
            "freelancerId",
            "username email"
        );

        res.status(200).json({
            message: "Applications fetched successfully",
            applications
        });

    } catch (error) {
        console.error("Get applications error:", error);

        res.status(500).json({
            message: "Failed to fetch applications"
        });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

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

            // Reject other pending applications
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
        }

        res.status(200).json({
            message: `Application ${status.toLowerCase()} successfully`,
            application,
            project
        });

    } catch (error) {
        console.error("Update application status error:", error);

        res.status(500).json({
            message: "Failed to update application status"
        });
    }
};
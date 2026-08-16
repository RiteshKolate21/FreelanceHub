import Project from "../models/Project.js";
import { createNotificationInternal } from "./notificationController.js";
import mongoose from "mongoose";

export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      skills,
      deadline
    } = req.body;

    // Validate required fields
    if (!title || !description || !budget) {
      return res.status(400).json({
        message: "Title, description and budget are required"
      });
    }

    const numericBudget = Number(budget);
    if (isNaN(numericBudget) || numericBudget <= 0) {
      return res.status(400).json({
        message: "Budget must be a positive number"
      });
    }

    const project = await Project.create({
      clientId: req.user.userId,
      title: title.trim(),
      description: description.trim(),
      budget: numericBudget,
      skills: Array.isArray(skills) ? skills : [],
      deadline: deadline || null
    });

    res.status(201).json({
      message: "Project created successfully",
      project
    });

  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Failed to create project",
      error: error.message
    });
  }
};

export const getAllProjects = async (req, res) => {
    try {
        const { skill, search, minBudget, maxBudget } = req.query;
        const filter = { status: "Open" };

        if (skill) {
          filter.skills = { $regex: skill, $options: "i" };
        }

        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
          ];
        }

        if (minBudget || maxBudget) {
          filter.budget = {};
          if (minBudget) filter.budget.$gte = Number(minBudget);
          if (maxBudget) filter.budget.$lte = Number(maxBudget);
        }

        const projects = await Project.find(filter)
          .populate("clientId", "username email")
          .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Projects fetched successfully",
            count: projects.length,
            projects
        });

    } catch (error) {
        console.error("Get projects error:", error);

        res.status(500).json({
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};

export const getProjectById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await Project.findById(req.params.id)
            .populate("clientId", "username email")
            .populate("freelancerId", "username email");

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.status(200).json({
            message: "Project fetched successfully",
            project
        });

    } catch (error) {
        console.error("Get project error:", error);

        res.status(500).json({
            message: "Failed to fetch project",
            error: error.message
        });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid project ID" });
        }

        const {
            title,
            description,
            budget,
            skills,
            deadline
        } = req.body;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only project owner can update
        if (project.clientId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not authorized to update this project"
            });
        }

        // Only open projects can be updated
        if (project.status !== "Open") {
            return res.status(400).json({
                message: "Only open projects can be updated"
            });
        }

        // Update only provided fields
        if (title !== undefined) project.title = title.trim();
        if (description !== undefined) project.description = description.trim();
        if (budget !== undefined) project.budget = Number(budget);
        if (skills !== undefined) project.skills = skills;
        if (deadline !== undefined) project.deadline = deadline;

        await project.save();

        res.status(200).json({
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        console.error("Update project error:", error);

        res.status(500).json({
            message: "Failed to update project",
            error: error.message
        });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only project owner can delete
        if (project.clientId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not authorized to delete this project"
            });
        }

        // Only open projects can be deleted
        if (project.status !== "Open") {
            return res.status(400).json({
                message: "Only open projects can be deleted"
            });
        }

        await Project.findByIdAndDelete(id);

        res.status(200).json({
            message: "Project deleted successfully"
        });

    } catch (error) {
        console.error("Delete project error:", error);

        res.status(500).json({
            message: "Failed to delete project",
            error: error.message
        });
    }
};

export const submitProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
          return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only the assigned freelancer can submit the project
        if (
            !project.freelancerId ||
            project.freelancerId.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not authorized to submit this project"
            });
        }

        // Project must be in progress
        if (project.status !== "In Progress") {
            return res.status(400).json({
                message: "Only projects in progress can be submitted"
            });
        }

        project.status = "Submitted";
        await project.save();

        // Notify Client about submission
        await createNotificationInternal({
            recipientId: project.clientId,
            type: "PROJECT_SUBMITTED",
            title: "Project Submitted for Completion",
            message: `Freelancer submitted work for project "${project.title}". Please review and complete.`,
            relatedProjectId: project._id
        });

        res.status(200).json({
            message: "Project submitted successfully",
            project
        });

    } catch (error) {
        console.error("Submit project error:", error);

        res.status(500).json({
            message: "Failed to submit project",
            error: error.message
        });
    }
};

export const completeProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
          return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only project owner can complete it
        if (project.clientId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not authorized to complete this project"
            });
        }

        // Project must be submitted first
        if (project.status !== "Submitted") {
            return res.status(400).json({
                message: "Only submitted projects can be completed"
            });
        }

        project.status = "Completed";
        await project.save();

        // Notify Freelancer about completion
        if (project.freelancerId) {
            await createNotificationInternal({
                recipientId: project.freelancerId,
                type: "PROJECT_COMPLETED",
                title: "Project Marked as Completed!",
                message: `Client has marked project "${project.title}" as completed.`,
                relatedProjectId: project._id
            });
        }

        res.status(200).json({
            message: "Project completed successfully",
            project
        });

    } catch (error) {
        console.error("Complete project error:", error);

        res.status(500).json({
            message: "Failed to complete project",
            error: error.message
        });
    }
};
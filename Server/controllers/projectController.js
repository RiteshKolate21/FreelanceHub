import Project from "../models/Project.js";

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

    const project = await Project.create({
      clientId: req.user.userId,
      title,
      description,
      budget,
      skills,
      deadline
    });

    res.status(201).json({
      message: "Project created successfully",
      project
    });

  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Failed to create project"
    });
  }
};

export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            status: "Open"
        }).populate(
            "clientId",
            "username email"
        );

        res.status(200).json({
            message: "Projects fetched successfully",
            projects
        });

    } catch (error) {
        console.error("Get projects error:", error);

        res.status(500).json({
            message: "Failed to fetch projects"
        });
    }
};

export const getProjectById = async (req, res) => {
    try {
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
            message: "Failed to fetch project"
        });
    }
};

export const submitProject = async (req, res) => {
    try {
        const { projectId } = req.params;

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

        res.status(200).json({
            message: "Project submitted successfully",
            project
        });

    } catch (error) {
        console.error("Submit project error:", error);

        res.status(500).json({
            message: "Failed to submit project"
        });
    }
};

export const completeProject = async (req, res) => {
    try {
        const { projectId } = req.params;

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

        res.status(200).json({
            message: "Project completed successfully",
            project
        });

    } catch (error) {
        console.error("Complete project error:", error);

        res.status(500).json({
            message: "Failed to complete project"
        });
    }
};
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
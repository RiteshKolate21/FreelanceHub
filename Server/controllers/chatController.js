import Chat from "../models/Chat.js";
import Project from "../models/Project.js";


// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { projectId, receiverId, message } = req.body;

        // Validate required fields
        if (!projectId || !receiverId || !message) {
            return res.status(400).json({
                message: "projectId, receiverId and message are required"
            });
        }

        // Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const currentUserId = req.user.userId;

        // Only project client or assigned freelancer can send messages
        const isClient =
            project.clientId.toString() === currentUserId;

        const isFreelancer =
            project.freelancerId &&
            project.freelancerId.toString() === currentUserId;

        if (!isClient && !isFreelancer) {
            return res.status(403).json({
                message: "You are not authorized to chat for this project"
            });
        }

        // Make sure receiver is part of this project
        const isValidReceiver =
            project.clientId.toString() === receiverId ||
            (
                project.freelancerId &&
                project.freelancerId.toString() === receiverId
            );

        if (!isValidReceiver) {
            return res.status(403).json({
                message: "Receiver is not part of this project"
            });
        }

        // Create message
        const chat = await Chat.create({
            projectId,
            senderId: currentUserId,
            receiverId,
            message
        });

        res.status(201).json({
            message: "Message sent successfully",
            chat
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to send message",
            error: error.message
        });
    }
};


// Get all messages for a project
export const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const currentUserId = req.user.userId;

        // Only project client or assigned freelancer can view chat
        const isClient =
            project.clientId.toString() === currentUserId;

        const isFreelancer =
            project.freelancerId &&
            project.freelancerId.toString() === currentUserId;

        if (!isClient && !isFreelancer) {
            return res.status(403).json({
                message: "You are not authorized to view this project chat"
            });
        }

        // Fetch messages
        const messages = await Chat.find({ projectId })
            .populate("senderId", "username email userType")
            .populate("receiverId", "username email userType")
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Messages fetched successfully",
            messages
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch messages",
            error: error.message
        });
    }
};
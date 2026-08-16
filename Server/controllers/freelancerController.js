import Freelancer from "../models/Freelancer.js";

// Create freelancer profile
export const createFreelancerProfile = async (req, res) => {
    try {
        const { skills, experience, bio } = req.body;

        // Check if profile already exists
        const existingProfile = await Freelancer.findOne({
            userId: req.user.userId
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "Freelancer profile already exists"
            });
        }

        const freelancer = await Freelancer.create({
            userId: req.user.userId,
            skills: skills || [],
            experience: experience || "",
            bio: bio || ""
        });

        res.status(201).json({
            message: "Freelancer profile created successfully",
            freelancer
        });

    } catch (error) {
        console.error("Create freelancer profile error:", error);

        res.status(500).json({
            message: "Failed to create freelancer profile"
        });
    }
};


// Get freelancer profile
export const getFreelancerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const freelancer = await Freelancer.findOne({
            userId
        }).populate(
            "userId",
            "username email userType"
        );

        if (!freelancer) {
            return res.status(404).json({
                message: "Freelancer profile not found"
            });
        }

        res.status(200).json({
            message: "Freelancer profile fetched successfully",
            freelancer
        });

    } catch (error) {
        console.error("Get freelancer profile error:", error);

        res.status(500).json({
            message: "Failed to fetch freelancer profile"
        });
    }
};


// Update freelancer profile
export const updateFreelancerProfile = async (req, res) => {
    try {
        const { skills, experience, bio } = req.body;

        const freelancer = await Freelancer.findOne({
            userId: req.user.userId
        });

        if (!freelancer) {
            return res.status(404).json({
                message: "Freelancer profile not found"
            });
        }

        if (skills !== undefined) {
            freelancer.skills = skills;
        }

        if (experience !== undefined) {
            freelancer.experience = experience;
        }

        if (bio !== undefined) {
            freelancer.bio = bio;
        }

        await freelancer.save();

        res.status(200).json({
            message: "Freelancer profile updated successfully",
            freelancer
        });

    } catch (error) {
        console.error("Update freelancer profile error:", error);

        res.status(500).json({
            message: "Failed to update freelancer profile"
        });
    }
};
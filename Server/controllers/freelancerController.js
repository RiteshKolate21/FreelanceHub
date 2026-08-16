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


// Get all freelancers with search, filtering,
// pagination and sorting
export const getAllFreelancers = async (req, res) => {
    try {
        const {
            skill,
            username,
            minRating,
            page = 1,
            limit = 10,
            sort = "rating"
        } = req.query;

        const filter = {};

        // Filter by skill
        if (skill) {
            filter.skills = {
                $regex: skill,
                $options: "i"
            };
        }

        // Filter by minimum rating
        if (minRating !== undefined) {
            const rating = Number(minRating);

            if (isNaN(rating)) {
                return res.status(400).json({
                    message: "minRating must be a number"
                });
            }

            if (rating < 0 || rating > 5) {
                return res.status(400).json({
                    message: "minRating must be between 0 and 5"
                });
            }

            filter.rating = {
                $gte: rating
            };
        }

        // Validate page
        const pageNumber = Number(page);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                message: "page must be a positive integer"
            });
        }

        // Validate limit
        const limitNumber = Number(limit);

        if (!Number.isInteger(limitNumber) || limitNumber < 1) {
            return res.status(400).json({
                message: "limit must be a positive integer"
            });
        }

        // Maximum 50 results per request
        const finalLimit = Math.min(limitNumber, 50);

        const skip = (pageNumber - 1) * finalLimit;

        // Sorting
        let sortOption;

        switch (sort) {
            case "latest":
                sortOption = { createdAt: -1 };
                break;

            case "oldest":
                sortOption = { createdAt: 1 };
                break;

            case "rating":
            default:
                sortOption = { rating: -1 };
                break;
        }

        // Total number of matching freelancers
        const total = await Freelancer.countDocuments(filter);

        // Fetch freelancers
        const freelancers = await Freelancer.find(filter)
            .populate(
                "userId",
                "username email userType"
            )
            .sort(sortOption)
            .skip(skip)
            .limit(finalLimit);

        // Username filtering
        // Username is stored in the User collection,
        // so filtering is done after populate.
        let filteredFreelancers = freelancers;

        if (username) {
            const searchUsername = username.toLowerCase();

            filteredFreelancers = freelancers.filter(
                freelancer =>
                    freelancer.userId &&
                    freelancer.userId.username &&
                    freelancer.userId.username
                        .toLowerCase()
                        .includes(searchUsername)
            );
        }

        res.status(200).json({
            message: "Freelancers fetched successfully",

            pagination: {
                page: pageNumber,
                limit: finalLimit,
                total,
                totalPages: Math.ceil(total / finalLimit)
            },

            count: filteredFreelancers.length,

            freelancers: filteredFreelancers
        });

    } catch (error) {
        console.error("Get freelancers error:", error);

        res.status(500).json({
            message: "Failed to fetch freelancers"
        });
    }
};
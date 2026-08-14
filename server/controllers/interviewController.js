const Interview = require("../models/Interview");
const User = require("../models/User");

const INTERVIEW_COST = 100;

const createInterview = async (req, res) => {
    try {
        const { role, experienceLevel, difficulty } = req.body;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Role is required"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.credits < INTERVIEW_COST) {
            return res.status(403).json({
                success: false,
                message: "Insufficient credits. An interview costs 100 credits."
            });
        }

        user.credits -= INTERVIEW_COST;
        await user.save();

        const interview = await Interview.create({
            user: user._id,
            role,
            experienceLevel: experienceLevel || "Fresher",
            difficulty: difficulty || "Medium"
        });

        res.status(201).json({
            success: true,
            message: "Interview created successfully",
            creditsUsed: INTERVIEW_COST,
            creditsRemaining: user.credits,
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        res.status(200).json({
            success: true,
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createInterview,
    getMyInterviews,
    getInterviewById
};
const Interview = require("../models/Interview");
const User = require("../models/User");
const Resume = require("../models/Resume");

const {
    generateInterviewQuestions
} = require("../services/aiService");

const INTERVIEW_COST = 100;


// CREATE INTERVIEW
const createInterview = async (req, res) => {
    try {
        const { role, experienceLevel, difficulty } = req.body;

        // Validate role
        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Role is required"
            });
        }

        // Find logged-in user
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check credits
        if (user.credits < INTERVIEW_COST) {
            return res.status(403).json({
                success: false,
                message: "Insufficient credits. An interview costs 100 credits."
            });
        }

        // Find latest resume
        const resume = await Resume.findOne({
            user: user._id
        }).sort({ createdAt: -1 });

        if (!resume) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume before starting an interview"
            });
        }

        // Generate AI questions
        const questions = await generateInterviewQuestions({
            resumeText: resume.extractedText,
            role,
            experienceLevel: experienceLevel || "Fresher",
            difficulty: difficulty || "Medium"
        });

        // Validate AI response
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(500).json({
                success: false,
                message: "AI failed to generate interview questions"
            });
        }

        // Create interview
        const interview = await Interview.create({
            user: user._id,
            role,
            experienceLevel: experienceLevel || "Fresher",
            difficulty: difficulty || "Medium",

            questions: questions.map((question) => ({
                question
            })),

            status: "in-progress"
        });

        // Deduct credits ONLY after interview creation succeeds
        user.credits -= INTERVIEW_COST;
        await user.save();

        res.status(201).json({
            success: true,
            message: "Interview created successfully",
            creditsUsed: INTERVIEW_COST,
            creditsRemaining: user.credits,
            interview
        });

    } catch (error) {
        console.error("Create Interview Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET MY INTERVIEWS
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
        console.error("Get Interviews Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET SINGLE INTERVIEW
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
        console.error("Get Interview Error:", error);

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
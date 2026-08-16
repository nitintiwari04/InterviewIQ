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
        const {
            role,
            experienceLevel,
            difficulty,
            questionCount
        } = req.body;

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

        const resume = await Resume.findOne({
            user: user._id
        }).sort({ createdAt: -1 });

        if (!resume) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume before starting an interview"
            });
        }

        const questions = await generateInterviewQuestions({
            resumeText: resume.extractedText,
            role,
            experienceLevel: experienceLevel || "Fresher",
            difficulty: difficulty || "Medium",
            questionCount: questionCount || 5
        });

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(500).json({
                success: false,
                message: "AI failed to generate interview questions"
            });
        }

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


// SUBMIT ANSWER
const submitAnswer = async (req, res) => {
    try {
        const {
            interviewId,
            questionId,
            answer
        } = req.body;

        if (!interviewId || !questionId || !answer?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Interview ID, question ID and answer are required"
            });
        }

        const interview = await Interview.findOne({
            _id: interviewId,
            user: req.user._id
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        const question = interview.questions.id(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        question.answer = answer.trim();

        // Temporary score until OpenAI API is available
        question.score = 0;
        question.feedback = "AI evaluation will be generated after API credits are available.";

        const allAnswered = interview.questions.every(
            (q) => q.answer && q.answer.trim().length > 0
        );

        if (allAnswered) {
            interview.status = "completed";
        } else {
            interview.status = "in-progress";
        }

        await interview.save();

        res.status(200).json({
            success: true,
            message: "Answer submitted successfully",
            interview
        });

    } catch (error) {
        console.error("Submit Answer Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createInterview,
    getMyInterviews,
    getInterviewById,
    submitAnswer
};
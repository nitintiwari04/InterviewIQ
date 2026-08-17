const Interview = require("../models/Interview");
const User = require("../models/User");
const Resume = require("../models/Resume");

const {
    generateInterviewQuestions
} = require("../services/aiService");

const INTERVIEW_COST = 100;


// TEMPORARY LOCAL ANSWER EVALUATOR
// This can later be replaced with AI evaluation.
const evaluateAnswer = (answer) => {
    const length = answer.trim().length;

    let score;
    let feedback;

    if (length < 50) {
        score = 35;
        feedback =
            "Answer is too brief. Explain your reasoning and provide more details or examples.";
    } else if (length < 120) {
        score = 55;
        feedback =
            "Answer shows some understanding, but it would benefit from more detail and a specific example.";
    } else if (length < 250) {
        score = 75;
        feedback =
            "Good answer with reasonable detail. Try to structure it more clearly and include a practical example.";
    } else {
        score = 90;
        feedback =
            "Strong and detailed answer. Keep the structure clear and focus on directly addressing the question.";
    }

    return {
        score,
        feedback
    };
};


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
        }).sort({
            createdAt: -1
        });

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

            experienceLevel:
                experienceLevel || "Fresher",

            difficulty:
                difficulty || "Medium",

            questions: questions.map((question) => ({
                question
            })),

            status: "in-progress"
        });

        // Deduct interview credits
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
        console.error(
            "Create Interview Error:",
            error
        );

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
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });

    } catch (error) {
        console.error(
            "Get Interviews Error:",
            error
        );

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
        console.error(
            "Get Interview Error:",
            error
        );

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

        // Validate request
        if (
            !interviewId ||
            !questionId ||
            !answer?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Interview ID, question ID and answer are required"
            });
        }

        // Find interview belonging to logged-in user
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

        // Prevent changes after completion
        if (interview.status === "completed") {
            return res.status(400).json({
                success: false,
                message:
                    "This interview has already been completed"
            });
        }

        // Find question
        const question =
            interview.questions.id(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Prevent duplicate submission
        if (
            question.answer &&
            question.answer.trim().length > 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This question has already been answered"
            });
        }

        const cleanedAnswer = answer.trim();

        // Evaluate answer
        const evaluation =
            evaluateAnswer(cleanedAnswer);

        // Save answer + evaluation
        question.answer = cleanedAnswer;

        question.score =
            evaluation.score;

        question.feedback =
            evaluation.feedback;

        // Check whether all questions are answered
        const allAnswered =
            interview.questions.every(
                (q) =>
                    q.answer &&
                    q.answer.trim().length > 0
            );

        if (allAnswered) {

            interview.status = "completed";

            // Calculate overall score
            const totalScore =
                interview.questions.reduce(
                    (total, q) =>
                        total + q.score,
                    0
                );

            interview.overallScore =
                Math.round(
                    totalScore /
                    interview.questions.length
                );

            // Generate overall feedback
            if (
                interview.overallScore >= 85
            ) {
                interview.overallFeedback =
                    "Excellent performance. Your answers were detailed and showed strong understanding.";
            } else if (
                interview.overallScore >= 70
            ) {
                interview.overallFeedback =
                    "Good performance. Your answers showed solid understanding, with some areas that can be improved.";
            } else if (
                interview.overallScore >= 50
            ) {
                interview.overallFeedback =
                    "Fair performance. Focus on providing more structured answers and practical examples.";
            } else {
                interview.overallFeedback =
                    "Your answers need more depth. Practice explaining concepts clearly and supporting your answers with examples.";
            }

        } else {

            interview.status =
                "in-progress";
        }

        await interview.save();

        res.status(200).json({
            success: true,

            message: allAnswered
                ? "Interview completed successfully"
                : "Answer submitted successfully",

            interview
        });

    } catch (error) {
        console.error(
            "Submit Answer Error:",
            error
        );

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
const Interview = require("../models/Interview");
const User = require("../models/User");
const Resume = require("../models/Resume");

const {
    generateInterviewQuestions
} = require("../services/aiService");

const INTERVIEW_COST = 100;


// ===============================
// HELPER: EVALUATE ANSWER
// ===============================

const evaluateAnswer = (answer) => {
    const text = answer.trim();

    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Basic keyword/structure evaluation.
    // This works without OpenAI credits.
    const hasExplanation = wordCount >= 30;
    const hasExample =
        /\b(example|for example|project|implemented|developed|built|used|experience)\b/i.test(
            text
        );

    const hasTechnicalTerms =
        /\b(api|database|mongodb|mysql|sql|react|node|express|javascript|java|python|backend|frontend|server|authentication|jwt|rest|docker|git|cloud|aws)\b/i.test(
            text
        );

    let score = 40;

    if (wordCount >= 20) score += 10;
    if (wordCount >= 40) score += 10;
    if (wordCount >= 70) score += 10;
    if (hasExample) score += 10;
    if (hasTechnicalTerms) score += 10;
    if (wordCount >= 100 && hasExample && hasTechnicalTerms) {
        score += 10;
    }

    score = Math.min(score, 100);

    let feedback = "";

    if (score >= 85) {
        feedback =
            "Excellent answer. You provided sufficient detail, relevant technical information, and practical context.";
    } else if (score >= 70) {
        feedback =
            "Good answer. Your response shows understanding, but adding more technical depth and specific examples would make it stronger.";
    } else if (score >= 55) {
        feedback =
            "Fair answer. Try explaining your reasoning in more detail and include a practical example from your projects or experience.";
    } else {
        feedback =
            "Your answer needs more detail. Explain the concept clearly, describe how it works, and provide a practical example.";
    }

    return {
        score,
        feedback
    };
};


// ===============================
// CREATE INTERVIEW
// ===============================

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
                message:
                    "Insufficient credits. An interview costs 100 credits."
            });
        }

        const resume = await Resume.findOne({
            user: user._id
        }).sort({ createdAt: -1 });

        if (!resume) {
            return res.status(400).json({
                success: false,
                message:
                    "Please upload a resume before starting an interview"
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
                message:
                    "AI failed to generate interview questions"
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


// ===============================
// GET MY INTERVIEWS
// ===============================

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


// ===============================
// GET SINGLE INTERVIEW
// ===============================

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


// ===============================
// SUBMIT ANSWER
// ===============================

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
                message:
                    "Interview ID, question ID and answer are required"
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

        if (interview.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "This interview has already been completed"
            });
        }

        const question = interview.questions.id(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Save answer
        question.answer = answer.trim();

        // Evaluate answer locally
        const evaluation = evaluateAnswer(answer);

        question.score = evaluation.score;
        question.feedback = evaluation.feedback;

        // Check whether every question has been answered
        const allAnswered = interview.questions.every(
            (q) =>
                q.answer &&
                q.answer.trim().length > 0
        );

        if (allAnswered) {

            interview.status = "completed";

            // Calculate overall score
            const totalScore = interview.questions.reduce(
                (sum, q) => sum + (q.score || 0),
                0
            );

            interview.overallScore = Math.round(
                totalScore / interview.questions.length
            );

            // Overall feedback
            if (interview.overallScore >= 85) {
                interview.overallFeedback =
                    "Excellent performance. You demonstrated strong technical understanding and provided detailed answers.";
            } else if (interview.overallScore >= 70) {
                interview.overallFeedback =
                    "Good performance. You have a solid foundation, but adding more depth and practical examples will improve your answers.";
            } else if (interview.overallScore >= 55) {
                interview.overallFeedback =
                    "Average performance. Continue practicing technical concepts and focus on giving structured, detailed answers.";
            } else {
                interview.overallFeedback =
                    "Your performance needs improvement. Focus on understanding core concepts and practicing structured responses.";
            }

        } else {
            interview.status = "in-progress";
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
const Interview = require("../models/Interview");
const User = require("../models/User");
const Resume = require("../models/Resume");

const {
    generateInterviewQuestions
} = require("../services/aiService");

const INTERVIEW_COST = 100;


// ==========================================
// LOCAL ANSWER EVALUATOR
// ==========================================

const evaluateAnswer = (
    answer,
    question
) => {

    const text = answer.trim();

    let score = 0;

    // Basic answer length
    if (text.length >= 50) {
        score += 20;
    }

    if (text.length >= 100) {
        score += 15;
    }

    if (text.length >= 200) {
        score += 15;
    }

    // Explanation quality
    const explanationWords = [
        "because",
        "therefore",
        "example",
        "for example",
        "used",
        "implemented",
        "developed",
        "approach",
        "solution",
        "problem",
        "result"
    ];

    explanationWords.forEach(
        (word) => {
            if (
                text.toLowerCase().includes(word)
            ) {
                score += 3;
            }
        }
    );

    // Technical vocabulary
    const technicalWords = [
        "api",
        "database",
        "backend",
        "frontend",
        "javascript",
        "react",
        "node",
        "express",
        "mongodb",
        "sql",
        "java",
        "python",
        "algorithm",
        "authentication",
        "jwt",
        "http",
        "rest",
        "git",
        "docker",
        "cloud",
        "server"
    ];

    technicalWords.forEach(
        (word) => {
            if (
                text.toLowerCase().includes(word)
            ) {
                score += 2;
            }
        }
    );

    // Cap score
    score = Math.min(
        100,
        Math.max(10, score)
    );

    let feedback;

    if (score >= 80) {
        feedback =
            "Strong answer with good explanation and relevant technical details.";
    } else if (score >= 60) {
        feedback =
            "Good answer, but it could be more structured and include more specific examples.";
    } else if (score >= 40) {
        feedback =
            "The answer shows some understanding, but more explanation and technical detail are needed.";
    } else {
        feedback =
            "The answer is too brief. Explain your approach, reasoning, and provide a practical example.";
    }

    return {
        score,
        feedback
    };
};


// ==========================================
// CREATE INTERVIEW
// ==========================================

const createInterview = async (
    req,
    res
) => {

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


        const user =
            await User.findById(
                req.user._id
            );


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        if (
            user.credits <
            INTERVIEW_COST
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Insufficient credits. An interview costs 100 credits."
            });
        }


        const resume =
            await Resume.findOne({
                user: user._id
            }).sort({
                createdAt: -1
            });


        if (!resume) {
            return res.status(400).json({
                success: false,
                message:
                    "Please upload a resume before starting an interview"
            });
        }


        const questions =
            await generateInterviewQuestions({
                resumeText:
                    resume.extractedText,

                role,

                experienceLevel:
                    experienceLevel ||
                    "Fresher",

                difficulty:
                    difficulty ||
                    "Medium",

                questionCount:
                    questionCount || 5
            });


        if (
            !Array.isArray(questions) ||
            questions.length === 0
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "Failed to generate interview questions"
            });
        }


        const interview =
            await Interview.create({

                user: user._id,

                role,

                experienceLevel:
                    experienceLevel ||
                    "Fresher",

                difficulty:
                    difficulty ||
                    "Medium",

                questions:
                    questions.map(
                        (question) => ({
                            question
                        })
                    ),

                status:
                    "in-progress"
            });


        // Deduct credits
        user.credits -=
            INTERVIEW_COST;

        await user.save();


        res.status(201).json({

            success: true,

            message:
                "Interview created successfully",

            creditsUsed:
                INTERVIEW_COST,

            creditsRemaining:
                user.credits,

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


// ==========================================
// GET MY INTERVIEWS
// ==========================================

const getMyInterviews = async (
    req,
    res
) => {

    try {

        const interviews =
            await Interview.find({
                user: req.user._id
            }).sort({
                createdAt: -1
            });


        res.status(200).json({

            success: true,

            count:
                interviews.length,

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


// ==========================================
// GET SINGLE INTERVIEW
// ==========================================

const getInterviewById = async (
    req,
    res
) => {

    try {

        const interview =
            await Interview.findOne({

                _id: req.params.id,

                user: req.user._id

            });


        if (!interview) {
            return res.status(404).json({
                success: false,
                message:
                    "Interview not found"
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


// ==========================================
// SUBMIT ANSWER
// ==========================================

const submitAnswer = async (
    req,
    res
) => {

    try {

        const {
            interviewId,
            questionId,
            answer
        } = req.body;


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


        const interview =
            await Interview.findOne({

                _id: interviewId,

                user: req.user._id

            });


        if (!interview) {

            return res.status(404).json({

                success: false,

                message:
                    "Interview not found"

            });
        }


        const question =
            interview.questions.id(
                questionId
            );


        if (!question) {

            return res.status(404).json({

                success: false,

                message:
                    "Question not found"

            });
        }


        // Save answer
        question.answer =
            answer.trim();


        // Evaluate answer
        const evaluation =
            evaluateAnswer(
                question.answer,
                question.question
            );


        question.score =
            evaluation.score;

        question.feedback =
            evaluation.feedback;


        // Check whether everything is answered
        const allAnswered =
            interview.questions.every(
                (q) =>
                    q.answer &&
                    q.answer.trim().length > 0
            );


        if (allAnswered) {

            interview.status =
                "completed";


            // Calculate overall score
            const totalScore =
                interview.questions.reduce(
                    (total, q) =>
                        total +
                        (q.score || 0),
                    0
                );


            interview.overallScore =
                Math.round(
                    totalScore /
                    interview.questions.length
                );


            // Generate strengths
            const strengths = [];


            interview.questions.forEach(
                (q) => {

                    if (
                        q.score >= 75
                    ) {

                        strengths.push(
                            "Demonstrated good understanding of the topic"
                        );

                    }

                }
            );


            if (
                strengths.length === 0
            ) {

                strengths.push(
                    "Completed all interview questions"
                );

            }


            // Generate improvements
            const improvements = [];


            interview.questions.forEach(
                (q) => {

                    if (
                        q.score < 60
                    ) {

                        improvements.push(
                            "Provide more detailed and structured answers"
                        );

                    }

                }
            );


            if (
                improvements.length === 0
            ) {

                improvements.push(
                    "Continue practicing with increasingly difficult questions"
                );

            }


            interview.strengths =
                [
                    ...new Set(strengths)
                ].slice(0, 3);


            interview.improvements =
                [
                    ...new Set(improvements)
                ].slice(0, 3);


            // Overall feedback
            if (
                interview.overallScore >=
                80
            ) {

                interview.overallFeedback =
                    "Excellent performance! Your answers demonstrated strong technical understanding and good communication.";

            } else if (
                interview.overallScore >=
                60
            ) {

                interview.overallFeedback =
                    "Good performance. Your fundamentals are solid, but more detailed and structured answers will improve your interview performance.";

            } else {

                interview.overallFeedback =
                    "Keep practicing. Focus on explaining your reasoning, using practical examples, and providing more technical detail.";

            }

        } else {

            interview.status =
                "in-progress";
        }


        await interview.save();


        res.status(200).json({

            success: true,

            message:
                "Answer submitted successfully",

            interview

        });

    } catch (error) {

        console.error(
            "Submit Answer Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};


module.exports = {

    createInterview,

    getMyInterviews,

    getInterviewById,

    submitAnswer

};
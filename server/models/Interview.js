const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true
        },

        answer: {
            type: String,
            default: ""
        },

        score: {
            type: Number,
            default: 0
        },

        feedback: {
            type: String,
            default: ""
        }
    },
    {
        _id: true
    }
);

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            required: true
        },

        experienceLevel: {
            type: String,
            enum: [
                "Fresher",
                "Junior",
                "Mid-Level",
                "Senior"
            ],
            default: "Fresher"
        },

        difficulty: {
            type: String,
            enum: [
                "Easy",
                "Medium",
                "Hard"
            ],
            default: "Medium"
        },

        questions: [questionSchema],

        overallScore: {
            type: Number,
            default: 0
        },

        overallFeedback: {
            type: String,
            default: ""
        },

        strengths: {
            type: [String],
            default: []
        },

        improvements: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: [
                "created",
                "in-progress",
                "completed"
            ],
            default: "created"
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Interview",
        interviewSchema
    );
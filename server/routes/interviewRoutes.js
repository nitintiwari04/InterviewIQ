const express = require("express");

const {
    createInterview,
    getMyInterviews,
    getInterviewById,
    submitAnswer
} = require("../controllers/interviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createInterview);

router.get("/", protect, getMyInterviews);

router.post("/answer", protect, submitAnswer);

router.get("/:id", protect, getInterviewById);

module.exports = router;
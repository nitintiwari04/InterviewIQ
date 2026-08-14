const fs = require("fs");
const pdfParse = require("pdf-parse");

const Resume = require("../models/Resume");

const { analyzeResume } = require("../services/aiService");

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF resume"
            });
        }

        const pdfBuffer = fs.readFileSync(req.file.path);

        const pdfData = await pdfParse(pdfBuffer);

        const extractedText = pdfData.text.trim();

        const aiAnalysis = await analyzeResume(extractedText);

        if (!extractedText) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from the PDF"
            });
        }

        const resume = await Resume.create({
            user: req.user._id,
            fileName: req.file.originalname,
            filePath: req.file.path,
            extractedText,
            aiAnalysis
        });

        res.status(201).json({
            success: true,
            message: "Resume uploaded and processed successfully",
            resume: {
                id: resume._id,
                fileName: resume.fileName,
                extractedText: resume.extractedText
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadResume
};
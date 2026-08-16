const fs = require("fs");
const { PDFParse } = require("pdf-parse");

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

        // pdf-parse v2.x API
        const parser = new PDFParse({
            data: pdfBuffer
        });

        const pdfData = await parser.getText();

        await parser.destroy();

        const extractedText = pdfData.text.trim();

        if (!extractedText) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from the PDF"
            });
        }

        // Analyze resume using AI
        const aiAnalysis = await analyzeResume(extractedText);

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
        console.error("Resume Upload Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadResume
};
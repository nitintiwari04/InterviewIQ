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

        // Extract text from PDF
        const parser = new PDFParse({
            data: pdfBuffer
        });

        const pdfData = await parser.getText();

        await parser.destroy();

        const extractedText =
            pdfData.text?.trim();

        if (!extractedText) {
            return res.status(400).json({
                success: false,
                message:
                    "Could not extract text from the PDF"
            });
        }

        /*
         * Resume analysis is optional.
         *
         * If OpenAI has no credits or the API fails,
         * we still save the resume and continue.
         */
        let aiAnalysis = "";

        try {
            aiAnalysis =
                await analyzeResume(extractedText);
        } catch (aiError) {
            console.warn(
                "AI resume analysis unavailable:",
                aiError.message
            );

            aiAnalysis =
                "AI resume analysis is currently unavailable. Resume text was successfully extracted.";
        }

        // Save resume
        const resume = await Resume.create({
            user: req.user._id,

            fileName:
                req.file.originalname,

            filePath:
                req.file.path,

            extractedText,

            aiAnalysis
        });

        res.status(201).json({
            success: true,

            message:
                "Resume uploaded and processed successfully",

            resume: {
                id: resume._id,

                fileName:
                    resume.fileName,

                extractedText:
                    resume.extractedText,

                aiAnalysis:
                    resume.aiAnalysis
            }
        });

    } catch (error) {
        console.error(
            "Resume Upload Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    uploadResume
};
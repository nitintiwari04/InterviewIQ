const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// ANALYZE RESUME
const analyzeResume = async (resumeText) => {
    const response = await client.responses.create({
        model: "gpt-5-mini",
        input: [
            {
                role: "system",
                content:
                    "You are an expert technical recruiter. Analyze resumes and return concise, structured information."
            },
            {
                role: "user",
                content: `
Analyze the following resume and identify:

1. Technical skills
2. Programming languages
3. Frameworks and technologies
4. Projects
5. Work/internship experience
6. Education
7. Suitable technical job roles

Resume:
${resumeText}
`
            }
        ]
    });

    return response.output_text;
};


// GENERATE INTERVIEW QUESTIONS
const generateInterviewQuestions = async ({
    resumeText,
    role,
    experienceLevel,
    difficulty
}) => {
    const response = await client.responses.create({
        model: "gpt-5-mini",
        input: [
            {
                role: "system",
                content:
                    "You are an expert technical interviewer who creates personalized technical interview questions."
            },
            {
                role: "user",
                content: `
Generate exactly 5 technical interview questions.

Candidate Role: ${role}
Experience Level: ${experienceLevel}
Difficulty: ${difficulty}

Candidate Resume:
${resumeText}

Requirements:
- Questions must be relevant to the candidate's resume.
- Include questions about projects and technologies mentioned.
- Match the requested difficulty.
- Focus on technical knowledge and practical understanding.
- Avoid generic HR questions.
- Return ONLY a valid JSON array of strings.

Example:
[
    "What is ...?",
    "How would you ...?",
    "Explain ...?",
    "Why did you ...?",
    "How would you improve ...?"
]
`
            }
        ]
    });

    try {
        return JSON.parse(response.output_text);
    } catch (error) {
        console.error("AI JSON Parse Error:", response.output_text);

        throw new Error(
            "AI returned an invalid question format"
        );
    }
};


module.exports = {
    analyzeResume,
    generateInterviewQuestions
};
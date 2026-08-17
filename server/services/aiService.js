const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// --------------------------------------------------
// LOCAL RESUME ANALYSIS FALLBACK
// --------------------------------------------------

const localResumeAnalysis = (resumeText) => {
    const text = resumeText.toLowerCase();

    const skills = [];

    const possibleSkills = [
        "javascript",
        "java",
        "python",
        "react",
        "node.js",
        "node",
        "express",
        "mongodb",
        "mysql",
        "sql",
        "html",
        "css",
        "git",
        "github",
        "docker",
        "aws",
        "kubernetes",
        "jenkins",
        "spring boot",
        "typescript",
        "c++",
        "c",
        "tensorflow",
        "pandas",
        "numpy"
    ];

    possibleSkills.forEach((skill) => {
        if (text.includes(skill)) {
            skills.push(skill);
        }
    });

    return JSON.stringify({
        technicalSkills: skills,
        message:
            "Resume analyzed locally because AI service is currently unavailable."
    });
};


// --------------------------------------------------
// ANALYZE RESUME
// --------------------------------------------------

const analyzeResume = async (resumeText) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return localResumeAnalysis(
                resumeText
            );
        }

        const response =
            await client.responses.create({
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

    } catch (error) {
        console.warn(
            "OpenAI resume analysis failed:",
            error.message
        );

        // Never block resume upload because of AI
        return localResumeAnalysis(
            resumeText
        );
    }
};


// --------------------------------------------------
// LOCAL QUESTION GENERATOR
// --------------------------------------------------

const generateLocalQuestions = ({
    resumeText,
    role,
    experienceLevel,
    difficulty,
    questionCount = 5
}) => {

    const text =
        resumeText.toLowerCase();

    const questions = [];

    // Detect technologies from resume
    const technologies = [];

    const techMap = [
        {
            keyword: "react",
            name: "React"
        },
        {
            keyword: "node",
            name: "Node.js"
        },
        {
            keyword: "express",
            name: "Express.js"
        },
        {
            keyword: "mongodb",
            name: "MongoDB"
        },
        {
            keyword: "mysql",
            name: "MySQL"
        },
        {
            keyword: "javascript",
            name: "JavaScript"
        },
        {
            keyword: "java",
            name: "Java"
        },
        {
            keyword: "python",
            name: "Python"
        },
        {
            keyword: "docker",
            name: "Docker"
        },
        {
            keyword: "aws",
            name: "AWS"
        },
        {
            keyword: "kubernetes",
            name: "Kubernetes"
        },
        {
            keyword: "git",
            name: "Git"
        },
        {
            keyword: "sql",
            name: "SQL"
        }
    ];

    techMap.forEach((tech) => {
        if (text.includes(tech.keyword)) {
            technologies.push(
                tech.name
            );
        }
    });


    // Resume/project question
    questions.push(
        `Tell me about one of the projects mentioned in your resume and explain your specific contribution to it.`
    );


    // Role-specific question
    questions.push(
        `For a ${role} position at the ${experienceLevel} level, explain the most important technical concepts you would need to understand.`
    );


    // Technology-specific questions
    technologies
        .slice(0, 3)
        .forEach((technology) => {

            questions.push(
                `Explain how you have used ${technology} in your projects and describe one practical challenge you faced while using it.`
            );

        });


    // Difficulty-based question
    if (difficulty === "Hard") {

        questions.push(
            `Suppose your ${role} application suddenly becomes slow in production. How would you identify the bottleneck and solve the problem?`
        );

    } else if (difficulty === "Easy") {

        questions.push(
            `Explain one important concept related to ${role} development in simple terms and give a practical example.`
        );

    } else {

        questions.push(
            `Describe a technical problem you faced while developing a project and explain step-by-step how you solved it.`
        );

    }


    // Generic technical question
    questions.push(
        `What improvements would you make to one of the projects listed on your resume if you had more development time?`
    );


    // Remove duplicates
    const uniqueQuestions =
        [...new Set(questions)];


    // Return requested number
    return uniqueQuestions.slice(
        0,
        Math.max(
            1,
            Math.min(
                questionCount,
                uniqueQuestions.length
            )
        )
    );
};


// --------------------------------------------------
// GENERATE INTERVIEW QUESTIONS
// --------------------------------------------------

const generateInterviewQuestions = async ({
    resumeText,
    role,
    experienceLevel,
    difficulty,
    questionCount = 5
}) => {

    try {

        if (!process.env.OPENAI_API_KEY) {
            console.warn(
                "OpenAI API key unavailable. Using local question generator."
            );

            return generateLocalQuestions({
                resumeText,
                role,
                experienceLevel,
                difficulty,
                questionCount
            });
        }


        const response =
            await client.responses.create({
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
Generate exactly ${questionCount} technical interview questions.

Candidate Role:
${role}

Experience Level:
${experienceLevel}

Difficulty:
${difficulty}

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


        const questions =
            JSON.parse(
                response.output_text
            );


        if (
            !Array.isArray(questions) ||
            questions.length === 0
        ) {
            throw new Error(
                "AI returned invalid questions"
            );
        }


        return questions.slice(
            0,
            questionCount
        );

    } catch (error) {

        console.warn(
            "OpenAI question generation failed. Using local fallback:",
            error.message
        );

        return generateLocalQuestions({
            resumeText,
            role,
            experienceLevel,
            difficulty,
            questionCount
        });
    }
};


module.exports = {
    analyzeResume,
    generateInterviewQuestions
};
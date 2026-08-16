import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {
    const navigate = useNavigate();

    const [role, setRole] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [interviewType, setInterviewType] = useState("");
    const [questionCount, setQuestionCount] = useState(5);
    const [loading, setLoading] = useState(false);

    const handleStartInterview = async (e) => {
        e.preventDefault();

        if (
            !role ||
            !experienceLevel ||
            !difficulty ||
            !interviewType
        ) {
            alert("Please complete all fields.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/interviews",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        role,
                        experienceLevel,
                        difficulty,
                        interviewType,
                        questionCount
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Failed to create interview.");
                return;
            }

            // Save the complete interview returned by backend
            localStorage.setItem(
                "currentInterview",
                JSON.stringify(data.interview)
            );

            // Save remaining credits
            localStorage.setItem(
                "credits",
                data.creditsRemaining
            );

            navigate("/interview");

        } catch (error) {
            console.error("Start Interview Error:", error);
            alert("Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-page">

            <header className="setup-header">

                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

                <div className="setup-brand">
                    <div className="brand-icon">IQ</div>
                    <span>InterviewIQ</span>
                </div>

            </header>

            <main className="setup-main">

                <div className="setup-title">

                    <span className="setup-badge">
                        AI Interview
                    </span>

                    <h1>Set Up Your Interview</h1>

                    <p>
                        Customize your interview experience before you begin.
                    </p>

                </div>

                <form
                    className="setup-card"
                    onSubmit={handleStartInterview}
                >

                    <div className="form-group">

                        <label htmlFor="role">
                            Target Role
                        </label>

                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">
                                Select your role
                            </option>

                            <option value="Software Engineer">
                                Software Engineer
                            </option>

                            <option value="Frontend Developer">
                                Frontend Developer
                            </option>

                            <option value="Backend Developer">
                                Backend Developer
                            </option>

                            <option value="Full Stack Developer">
                                Full Stack Developer
                            </option>

                            <option value="Data Scientist">
                                Data Scientist
                            </option>

                            <option value="DevOps Engineer">
                                DevOps Engineer
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label htmlFor="experience">
                            Experience Level
                        </label>

                        <select
                            id="experience"
                            value={experienceLevel}
                            onChange={(e) =>
                                setExperienceLevel(e.target.value)
                            }
                        >
                            <option value="">
                                Select experience level
                            </option>

                            <option value="Fresher">
                                Fresher
                            </option>

                            <option value="Junior">
                                Junior (0–2 years)
                            </option>

                            <option value="Mid-Level">
                                Mid Level (2–5 years)
                            </option>

                            <option value="Senior">
                                Senior (5+ years)
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label htmlFor="difficulty">
                            Difficulty
                        </label>

                        <select
                            id="difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="">
                                Select difficulty
                            </option>

                            <option value="Easy">
                                Easy
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="Hard">
                                Hard
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label htmlFor="interviewType">
                            Interview Type
                        </label>

                        <select
                            id="interviewType"
                            value={interviewType}
                            onChange={(e) =>
                                setInterviewType(e.target.value)
                            }
                        >
                            <option value="">
                                Select interview type
                            </option>

                            <option value="Technical">
                                Technical
                            </option>

                            <option value="Behavioral">
                                Behavioral
                            </option>

                            <option value="Mixed">
                                Mixed
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label htmlFor="questionCount">
                            Number of Questions
                        </label>

                        <select
                            id="questionCount"
                            value={questionCount}
                            onChange={(e) =>
                                setQuestionCount(Number(e.target.value))
                            }
                        >
                            <option value={5}>
                                5 Questions
                            </option>

                            <option value={10}>
                                10 Questions
                            </option>

                            <option value={15}>
                                15 Questions
                            </option>

                            <option value={20}>
                                20 Questions
                            </option>

                        </select>

                    </div>

                    <div className="setup-summary">

                        <div>
                            <span>⚡</span>

                            <div>
                                <strong>Interview Credit</strong>

                                <p>
                                    100 credits will be used for this interview
                                </p>
                            </div>
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="start-interview-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Generating AI Interview..."
                            : "Start AI Interview"}

                        {!loading && <span>→</span>}
                    </button>

                </form>

            </main>

        </div>
    );
}

export default InterviewSetup;
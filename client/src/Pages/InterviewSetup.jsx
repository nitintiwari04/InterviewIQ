import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {
    const navigate = useNavigate();

    const [role, setRole] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [interviewType, setInterviewType] = useState("");
    const [questionCount, setQuestionCount] = useState(5);

    const handleStartInterview = (e) => {
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

        const interviewConfig = {
            role,
            experienceLevel,
            difficulty,
            interviewType,
            questionCount
        };

        localStorage.setItem(
            "interviewConfig",
            JSON.stringify(interviewConfig)
        );

        navigate("/interview");
    };

    return (
        <div className="setup-page">

            {/* Header */}
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

            {/* Main */}
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

                    {/* Role */}
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

                    {/* Experience */}
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

                            <option value="Mid Level">
                                Mid Level (2–5 years)
                            </option>

                            <option value="Senior">
                                Senior (5+ years)
                            </option>

                        </select>

                    </div>

                    {/* Difficulty */}
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

                    {/* Interview Type */}
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

                    {/* Question Count */}
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
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                            <option value={15}>15 Questions</option>
                            <option value={20}>20 Questions</option>
                        </select>

                    </div>

                    {/* Summary */}
                    <div className="setup-summary">

                        <div>
                            <span>⚡</span>
                            <div>
                                <strong>Interview Credit</strong>
                                <p>
                                    10 credit will be used for this interview
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="start-interview-btn"
                    >
                        Start AI Interview
                        <span>→</span>
                    </button>

                </form>

            </main>

        </div>
    );
}

export default InterviewSetup;
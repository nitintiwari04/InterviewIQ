import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewResult() {
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    const token = localStorage.getItem("token");
    const interviewId = localStorage.getItem("currentInterviewId");

    useEffect(() => {
        const fetchResult = async () => {
            if (!token || !interviewId) {
                navigate("/dashboard");
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:5000/api/interviews/${interviewId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    alert(data.message || "Unable to load interview result");
                    navigate("/dashboard");
                    return;
                }

                setInterview(data.interview);

            } catch (error) {
                console.error("Result fetch error:", error);
                alert("Unable to load interview result.");
                navigate("/dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [token, interviewId, navigate]);

    const handleDownload = () => {
        if (!interview) return;

        setDownloading(true);

        const questions = interview.questions
            .map(
                (question, index) => `
Question ${index + 1}:
${question.question}

Your Answer:
${question.answer || "Not answered"}

Score:
${question.score || 0}/100

Feedback:
${question.feedback || "No feedback available"}

----------------------------------------
`
            )
            .join("\n");

        const summary = `
INTERVIEWIQ - INTERVIEW SUMMARY
========================================

Role: ${interview.role}
Experience Level: ${interview.experienceLevel}
Difficulty: ${interview.difficulty}

Overall Score:
${interview.overallScore}/100

Overall Feedback:
${interview.overallFeedback}

Questions:
${interview.questions.length}

${questions}

Thank you for using InterviewIQ.
`;

        const blob = new Blob([summary], {
            type: "text/plain"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "InterviewIQ-Interview-Summary.txt";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        setTimeout(() => {
            setDownloading(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Preparing your interview results...</p>
            </div>
        );
    }

    if (!interview) {
        return null;
    }

    const score = interview.overallScore || 0;

    const performance =
        score >= 85
            ? "Excellent"
            : score >= 70
            ? "Good"
            : score >= 55
            ? "Average"
            : "Needs Improvement";

    const strengths = interview.questions
        .filter((question) => question.score >= 70)
        .slice(0, 3);

    const improvements = interview.questions
        .filter((question) => question.score < 70)
        .slice(0, 3);

    return (
        <div className="result-page">

            {/* HEADER */}

            <header className="result-header">

                <div className="result-brand">

                    <div className="brand-icon">
                        IQ
                    </div>

                    <div>
                        <strong>
                            InterviewIQ
                        </strong>

                        <span>
                            Interview Results
                        </span>
                    </div>

                </div>

            </header>


            {/* MAIN */}

            <main className="result-main">

                {/* HEADING */}

                <section className="result-heading">

                    <span className="result-badge">
                        Interview Completed 🎉
                    </span>

                    <h1>
                        Great job!
                    </h1>

                    <p>
                        Here's how you performed in your interview.
                    </p>

                </section>


                {/* SCORE */}

                <section className="score-card">

                    <div className="score-circle">

                        <div>
                            <strong>
                                {score}
                            </strong>

                            <span>
                                /100
                            </span>
                        </div>

                    </div>


                    <div className="score-info">

                        <h2>
                            Overall Performance
                        </h2>

                        <p>
                            {interview.overallFeedback ||
                                "Your interview has been evaluated."}
                        </p>

                        <div className="score-label">

                            <span>
                                Performance
                            </span>

                            <strong>
                                {performance}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* STATS */}

                <section className="result-stats">

                    <div className="result-stat">

                        <span>
                            ❓
                        </span>

                        <div>

                            <small>
                                Questions
                            </small>

                            <strong>
                                {
                                    interview.questions.filter(
                                        (q) =>
                                            q.answer &&
                                            q.answer.trim()
                                    ).length
                                }
                                /
                                {interview.questions.length}
                            </strong>

                        </div>

                    </div>


                    <div className="result-stat">

                        <span>
                            🎯
                        </span>

                        <div>

                            <small>
                                Score
                            </small>

                            <strong>
                                {score}%
                            </strong>

                        </div>

                    </div>


                    <div className="result-stat">

                        <span>
                            ⚡
                        </span>

                        <div>

                            <small>
                                Credits Used
                            </small>

                            <strong>
                                100
                            </strong>

                        </div>

                    </div>

                </section>


                {/* FEEDBACK */}

                <section className="feedback-grid">

                    {/* STRENGTHS */}

                    <div className="feedback-card">

                        <div className="feedback-title">

                            <span>
                                💪
                            </span>

                            <h2>
                                Strengths
                            </h2>

                        </div>


                        <ul>

                            {strengths.length > 0 ? (
                                strengths.map(
                                    (question, index) => (
                                        <li key={question._id || index}>

                                            <span>
                                                ✓
                                            </span>

                                            Question {index + 1} —
                                            Score {question.score}/100

                                        </li>
                                    )
                                )
                            ) : (
                                <li>
                                    <span>
                                        ✓
                                    </span>

                                    Keep practicing to build
                                    stronger answers.
                                </li>
                            )}

                        </ul>

                    </div>


                    {/* IMPROVEMENTS */}

                    <div className="feedback-card">

                        <div className="feedback-title">

                            <span>
                                📈
                            </span>

                            <h2>
                                Areas to Improve
                            </h2>

                        </div>


                        <ul>

                            {improvements.length > 0 ? (
                                improvements.map(
                                    (question, index) => (
                                        <li key={question._id || index}>

                                            <span>
                                                →
                                            </span>

                                            Question {index + 1} —
                                            {question.feedback}

                                        </li>
                                    )
                                )
                            ) : (
                                <li>
                                    <span>
                                        →
                                    </span>

                                    Continue practicing to maintain
                                    your performance.
                                </li>
                            )}

                        </ul>

                    </div>

                </section>


                {/* QUESTION-BY-QUESTION REVIEW */}

                <section className="question-review">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Question Review
                            </h2>

                            <p>
                                Review your answers and feedback
                            </p>

                        </div>

                    </div>


                    <div className="review-list">

                        {interview.questions.map(
                            (question, index) => (

                                <div
                                    className="review-card"
                                    key={question._id || index}
                                >

                                    <div className="review-card-header">

                                        <span>
                                            Question {index + 1}
                                        </span>

                                        <strong>
                                            {question.score}/100
                                        </strong>

                                    </div>


                                    <h3>
                                        {question.question}
                                    </h3>


                                    <div className="review-answer">

                                        <strong>
                                            Your Answer
                                        </strong>

                                        <p>
                                            {question.answer ||
                                                "No answer provided."}
                                        </p>

                                    </div>


                                    <div className="review-feedback">

                                        <strong>
                                            AI Feedback
                                        </strong>

                                        <p>
                                            {question.feedback ||
                                                "No feedback available."}
                                        </p>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </section>


                {/* ACTIONS */}

                <section className="result-actions">

                    <button
                        className="download-btn"
                        onClick={handleDownload}
                    >
                        {downloading
                            ? "Preparing Summary..."
                            : "⬇ Download Interview Summary"}
                    </button>


                    <button
                        className="dashboard-btn"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>


                    <button
                        className="retry-btn"
                        onClick={() =>
                            navigate("/interview/setup")
                        }
                    >
                        Start Another Interview
                    </button>

                </section>

            </main>

        </div>
    );
}

export default InterviewResult;
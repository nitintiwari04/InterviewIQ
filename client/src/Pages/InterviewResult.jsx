import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewResult() {
    const navigate = useNavigate();
    const [downloading, setDownloading] = useState(false);

    // Temporary result data.
    // Later this will come from the backend/AI evaluation.
    const result = {
        score: 82,
        totalQuestions: 5,
        answeredQuestions: 5,
        strengths: [
            "Good understanding of technical concepts",
            "Clear communication",
            "Provided relevant examples"
        ],
        improvements: [
            "Give more structured answers",
            "Add more specific project examples",
            "Improve confidence in behavioral questions"
        ]
    };

    const handleDownload = () => {
        setDownloading(true);

        const summary = `
InterviewIQ - Interview Summary

Overall Score: ${result.score}/100

Questions Answered: ${result.answeredQuestions}/${result.totalQuestions}

Strengths:
${result.strengths.map((item) => `- ${item}`).join("\n")}

Areas for Improvement:
${result.improvements.map((item) => `- ${item}`).join("\n")}

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

    return (
        <div className="result-page">

            {/* Header */}
            <header className="result-header">

                <div className="result-brand">
                    <div className="brand-icon">IQ</div>

                    <div>
                        <strong>InterviewIQ</strong>
                        <span>Interview Results</span>
                    </div>
                </div>

            </header>

            <main className="result-main">

                {/* Result Heading */}
                <section className="result-heading">

                    <span className="result-badge">
                        Interview Completed 🎉
                    </span>

                    <h1>Great job!</h1>

                    <p>
                        Here's how you performed in your interview.
                    </p>

                </section>

                {/* Score */}
                <section className="score-card">

                    <div className="score-circle">

                        <div>
                            <strong>{result.score}</strong>
                            <span>/100</span>
                        </div>

                    </div>

                    <div className="score-info">

                        <h2>Overall Performance</h2>

                        <p>
                            You performed well! Keep practicing to improve
                            your interview confidence.
                        </p>

                        <div className="score-label">
                            <span>Performance</span>
                            <strong>Good</strong>
                        </div>

                    </div>

                </section>

                {/* Stats */}
                <section className="result-stats">

                    <div className="result-stat">
                        <span>❓</span>
                        <div>
                            <small>Questions</small>
                            <strong>
                                {result.answeredQuestions}/
                                {result.totalQuestions}
                            </strong>
                        </div>
                    </div>

                    <div className="result-stat">
                        <span>🎯</span>
                        <div>
                            <small>Score</small>
                            <strong>{result.score}%</strong>
                        </div>
                    </div>

                    <div className="result-stat">
                        <span>⚡</span>
                        <div>
                            <small>Credits Used</small>
                            <strong>10</strong>
                        </div>
                    </div>

                </section>

                {/* Feedback */}
                <section className="feedback-grid">

                    {/* Strengths */}
                    <div className="feedback-card">

                        <div className="feedback-title">
                            <span>💪</span>
                            <h2>Strengths</h2>
                        </div>

                        <ul>
                            {result.strengths.map((strength, index) => (
                                <li key={index}>
                                    <span>✓</span>
                                    {strength}
                                </li>
                            ))}
                        </ul>

                    </div>

                    {/* Improvements */}
                    <div className="feedback-card">

                        <div className="feedback-title">
                            <span>📈</span>
                            <h2>Areas to Improve</h2>
                        </div>

                        <ul>
                            {result.improvements.map((item, index) => (
                                <li key={index}>
                                    <span>→</span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                    </div>

                </section>

                {/* Actions */}
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
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </button>

                    <button
                        className="retry-btn"
                        onClick={() => navigate("/interview/setup")}
                    >
                        Start Another Interview
                    </button>

                </section>

            </main>

        </div>
    );
}

export default InterviewResult;
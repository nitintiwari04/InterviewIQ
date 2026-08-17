import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewResult() {

    const navigate = useNavigate();

    const [interview, setInterview] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [downloading, setDownloading] =
        useState(false);

    const token =
        localStorage.getItem("token");

    const interviewId =
        localStorage.getItem(
            "currentInterviewId"
        );


    useEffect(() => {

        const fetchResult = async () => {

            if (!token || !interviewId) {

                navigate("/dashboard");

                return;
            }


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/interviews/${interviewId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    alert(
                        data.message ||
                        "Unable to load interview result"
                    );

                    navigate("/dashboard");

                    return;
                }


                setInterview(
                    data.interview
                );

            } catch (error) {

                console.error(
                    "Result error:",
                    error
                );

                alert(
                    "Unable to load interview result."
                );

                navigate("/dashboard");

            } finally {

                setLoading(false);

            }
        };


        fetchResult();

    }, [
        token,
        interviewId,
        navigate
    ]);


    const handleDownload = () => {

        if (!interview) return;

        setDownloading(true);


        const summary = `

InterviewIQ - Interview Summary

Role: ${interview.role}

Experience Level:
${interview.experienceLevel}

Difficulty:
${interview.difficulty}

Overall Score:
${interview.overallScore}/100

Questions:
${interview.questions.length}

Strengths:
${(interview.strengths || [])
    .map(
        (item) => `- ${item}`
    )
    .join("\n")}

Areas for Improvement:
${(interview.improvements || [])
    .map(
        (item) => `- ${item}`
    )
    .join("\n")}

Overall Feedback:
${interview.overallFeedback}

Question-wise Performance:

${interview.questions
    .map(
        (q, index) => `
Question ${index + 1}:
${q.question}

Your Answer:
${q.answer}

Score:
${q.score}/100

Feedback:
${q.feedback}
`
    )
    .join("\n")}

Thank you for using InterviewIQ.
`;


        const blob =
            new Blob(
                [summary],
                {
                    type:
                        "text/plain"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            "InterviewIQ-Interview-Summary.txt";


        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );


        setTimeout(() => {

            setDownloading(false);

        }, 500);
    };


    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="loader"></div>

                <p>
                    Analyzing your interview...
                </p>

            </div>

        );
    }


    if (!interview) {
        return null;
    }


    const score =
        interview.overallScore || 0;


    let performance =
        "Needs Improvement";


    if (score >= 80) {

        performance =
            "Excellent";

    } else if (score >= 60) {

        performance =
            "Good";

    } else if (score >= 40) {

        performance =
            "Average";
    }


    return (

        <div className="result-page">

            {/* Header */}

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


            <main className="result-main">

                {/* Heading */}

                <section className="result-heading">

                    <span className="result-badge">
                        Interview Completed 🎉
                    </span>

                    <h1>
                        Great job!
                    </h1>

                    <p>
                        Here's how you performed
                        in your interview.
                    </p>

                </section>


                {/* Score */}

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
                            {interview.overallFeedback}
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


                {/* Stats */}

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
                                {
                                    interview.questions.length
                                }
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


                {/* Feedback */}

                <section className="feedback-grid">

                    {/* Strengths */}

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

                            {(
                                interview.strengths ||
                                []
                            ).map(
                                (
                                    strength,
                                    index
                                ) => (

                                    <li
                                        key={
                                            index
                                        }
                                    >

                                        <span>
                                            ✓
                                        </span>

                                        {strength}

                                    </li>

                                )
                            )}

                        </ul>

                    </div>


                    {/* Improvements */}

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

                            {(
                                interview.improvements ||
                                []
                            ).map(
                                (
                                    item,
                                    index
                                ) => (

                                    <li
                                        key={
                                            index
                                        }
                                    >

                                        <span>
                                            →
                                        </span>

                                        {item}

                                    </li>

                                )
                            )}

                        </ul>

                    </div>

                </section>


                {/* Question Performance */}

                <section className="feedback-card">

                    <div className="feedback-title">

                        <span>
                            📊
                        </span>

                        <h2>
                            Question Performance
                        </h2>

                    </div>


                    <ul>

                        {interview.questions.map(
                            (
                                question,
                                index
                            ) => (

                                <li
                                    key={
                                        question._id
                                    }
                                    style={{
                                        display:
                                            "block",
                                        marginBottom:
                                            "20px"
                                    }}
                                >

                                    <strong>
                                        Q{index + 1}.{" "}
                                        {
                                            question.question
                                        }
                                    </strong>

                                    <br />

                                    <small>
                                        Score:{" "}
                                        <strong>
                                            {
                                                question.score
                                            }
                                            /100
                                        </strong>
                                    </small>

                                    <br />

                                    <small>
                                        {
                                            question.feedback
                                        }
                                    </small>

                                </li>

                            )
                        )}

                    </ul>

                </section>


                {/* Actions */}

                <section className="result-actions">

                    <button
                        className="download-btn"
                        onClick={
                            handleDownload
                        }
                    >

                        {downloading
                            ? "Preparing Summary..."
                            : "⬇ Download Interview Summary"}

                    </button>


                    <button
                        className="dashboard-btn"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        Back to Dashboard
                    </button>


                    <button
                        className="retry-btn"
                        onClick={() =>
                            navigate(
                                "/interview/setup"
                            )
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
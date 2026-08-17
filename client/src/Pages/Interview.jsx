import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Interview() {
    const navigate = useNavigate();

    const [config, setConfig] = useState(null);
    const [interview, setInterview] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(120);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    // Load interview configuration
    useEffect(() => {
        const savedConfig =
            localStorage.getItem("interviewConfig");

        if (!savedConfig) {
            navigate("/interview/setup");
            return;
        }

        try {
            setConfig(JSON.parse(savedConfig));
        } catch (error) {
            console.error(
                "Invalid interview configuration:",
                error
            );

            localStorage.removeItem("interviewConfig");
            navigate("/interview/setup");
        }
    }, [navigate]);


    // Create interview
    useEffect(() => {
        const createInterview = async () => {
            if (!config || !token) return;

            // Prevent duplicate interview creation
            const existingInterviewId =
                localStorage.getItem(
                    "currentInterviewId"
                );

            if (existingInterviewId) {
                try {
                    const response = await fetch(
                        `http://localhost:5000/api/interviews/${existingInterviewId}`,
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
                        response.ok &&
                        data.success &&
                        data.interview &&
                        data.interview.status !==
                            "completed"
                    ) {
                        setInterview(
                            data.interview
                        );
                        setLoading(false);
                        return;
                    }

                    localStorage.removeItem(
                        "currentInterviewId"
                    );

                } catch (error) {
                    console.error(
                        "Existing interview error:",
                        error
                    );

                    localStorage.removeItem(
                        "currentInterviewId"
                    );
                }
            }

            try {
                const response = await fetch(
                    "http://localhost:5000/api/interviews",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify(
                            config
                        )
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
                            "Failed to create interview"
                    );

                    navigate(
                        "/interview/setup"
                    );

                    return;
                }

                setInterview(
                    data.interview
                );

                localStorage.setItem(
                    "currentInterviewId",
                    data.interview._id
                );

            } catch (error) {
                console.error(
                    "Create interview error:",
                    error
                );

                alert(
                    "Unable to start interview."
                );

                navigate(
                    "/interview/setup"
                );

            } finally {
                setLoading(false);
            }
        };

        if (config) {
            createInterview();
        }
    }, [config, token, navigate]);


    // Timer
    useEffect(() => {
        if (!interview || isSubmitting)
            return;

        if (timeLeft <= 0) {
            handleSubmit(true);
            return;
        }

        const timer =
            setInterval(() => {
                setTimeLeft(
                    (prev) =>
                        prev - 1
                );
            }, 1000);

        return () =>
            clearInterval(timer);

    }, [
        timeLeft,
        interview,
        isSubmitting
    ]);


    const formatTime = () => {
        const minutes =
            Math.floor(
                timeLeft / 60
            );

        const seconds =
            timeLeft % 60;

        return `${String(
            minutes
        ).padStart(2, "0")}:${String(
            seconds
        ).padStart(2, "0")}`;
    };


    const handleSubmit = async (
        isAutoSubmit = false
    ) => {
        if (
            isSubmitting ||
            !interview
        ) {
            return;
        }

        // For manual submission, answer is required.
        // For automatic timeout, submit only if
        // the user has typed something.
        if (
            !answer.trim() &&
            !isAutoSubmit
        ) {
            alert(
                "Please provide an answer before continuing."
            );

            return;
        }

        const question =
            interview.questions[
                currentQuestion
            ];

        if (!question) return;

        // If timer expires with no answer,
        // don't send an invalid request.
        if (
            isAutoSubmit &&
            !answer.trim()
        ) {
            alert(
                "Time is up. Please answer this question before continuing."
            );

            setTimeLeft(120);

            return;
        }

        setIsSubmitting(true);

        try {
            const response =
                await fetch(
                    "http://localhost:5000/api/interviews/answer",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            interviewId:
                                interview._id,

                            questionId:
                                question._id,

                            answer:
                                answer.trim()
                        })
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
                        "Failed to submit answer"
                );

                return;
            }

            setInterview(
                data.interview
            );

            const isLastQuestion =
                currentQuestion >=
                data.interview.questions
                    .length - 1;

            if (isLastQuestion) {

                localStorage.removeItem(
                    "interviewConfig"
                );

                navigate(
                    "/interview/result"
                );

                return;
            }

            setCurrentQuestion(
                (prev) =>
                    prev + 1
            );

            setAnswer("");

            setTimeLeft(120);

        } catch (error) {
            console.error(
                "Submit answer error:",
                error
            );

            alert(
                "Unable to submit answer."
            );

        } finally {
            setIsSubmitting(false);
        }
    };


    if (
        loading ||
        !interview
    ) {
        return (
            <div className="dashboard-loading">

                <div className="loader"></div>

                <p>
                    Preparing your interview...
                </p>

            </div>
        );
    }


    const question =
        interview.questions[
            currentQuestion
        ];


    return (
        <div className="interview-page">

            <header className="interview-header">

                <div className="interview-brand">

                    <div className="brand-icon">
                        IQ
                    </div>

                    <div>
                        <strong>
                            InterviewIQ
                        </strong>

                        <span>
                            AI Interview
                        </span>
                    </div>

                </div>


                <div className="interview-progress">
                    Question{" "}
                    {currentQuestion + 1}{" "}
                    of{" "}
                    {interview.questions.length}
                </div>


                <div className="timer">
                    ⏱{" "}
                    {formatTime()}
                </div>

            </header>


            <div className="progress-container">

                <div
                    className="progress-bar"

                    style={{
                        width:
                            `${
                                (
                                    (
                                        currentQuestion +
                                        1
                                    ) /
                                    interview
                                        .questions
                                        .length
                                ) *
                                100
                            }%`
                    }}
                ></div>

            </div>


            <main className="interview-main">

                <div className="interview-info">

                    <div>

                        <span className="question-category">
                            AI Interview
                        </span>

                        <h1>
                            Question{" "}
                            {currentQuestion + 1}
                        </h1>

                    </div>


                    <div className="interview-details">

                        <span>
                            {interview.role}
                        </span>

                        <span>
                            •
                        </span>

                        <span>
                            {interview.difficulty}
                        </span>

                    </div>

                </div>


                <section className="question-card">

                    <div className="ai-avatar">
                        🤖
                    </div>


                    <div className="question-content">

                        <span>
                            AI Interviewer
                        </span>

                        <h2>
                            {question.question}
                        </h2>

                    </div>

                </section>


                <section className="answer-section">

                    <div className="answer-header">

                        <h3>
                            Your Answer
                        </h3>

                        <span>
                            {answer.length}{" "}
                            characters
                        </span>

                    </div>


                    <textarea
                        value={answer}

                        onChange={(e) =>
                            setAnswer(
                                e.target.value
                            )
                        }

                        placeholder="Type your answer here..."
                    />


                    <p className="answer-tip">
                        💡 Tip: Structure your
                        answer clearly and
                        provide specific
                        examples where possible.
                    </p>

                </section>


                <div className="interview-controls">

                    <button
                        className="exit-btn"

                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        Exit Interview
                    </button>


                    <button
                        className="submit-answer-btn"

                        onClick={() =>
                            handleSubmit(false)
                        }

                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : currentQuestion ===
                              interview.questions
                                  .length - 1
                            ? "Finish Interview"
                            : "Submit Answer →"}
                    </button>

                </div>

            </main>

        </div>
    );
}

export default Interview;
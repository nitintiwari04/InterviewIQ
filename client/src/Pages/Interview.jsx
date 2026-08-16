import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Interview() {
    const navigate = useNavigate();

    const [config, setConfig] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [answer, setAnswer] = useState("");
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const questions = [
        {
            question:
                "Tell me about yourself and your background in software development.",
            category: "Introduction"
        },
        {
            question:
                "Explain one challenging project you have worked on and how you solved the problem.",
            category: "Technical"
        },
        {
            question:
                "What is the difference between authentication and authorization?",
            category: "Technical"
        },
        {
            question:
                "How do you handle a situation where you disagree with a team member?",
            category: "Behavioral"
        },
        {
            question:
                "Where do you see yourself professionally in the next five years?",
            category: "Career"
        }
    ];

    // Load interview configuration
    useEffect(() => {
        const savedConfig = localStorage.getItem("interviewConfig");

        if (!savedConfig) {
            navigate("/interview/setup");
            return;
        }

        try {
            setConfig(JSON.parse(savedConfig));
        } catch (error) {
            console.error("Invalid interview configuration:", error);
            navigate("/interview/setup");
        }
    }, [navigate]);

    // Timer
    useEffect(() => {
        if (!config) {
            return;
        }

        if (timeLeft <= 0) {
            handleNext(answer);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, config]);

    const formatTime = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(2, "0")}`;
    };

    const handleNext = (currentAnswer = answer) => {
        const updatedAnswers = [
            ...answers,
            {
                questionNumber: currentQuestion,
                question: questions[currentQuestion - 1].question,
                category: questions[currentQuestion - 1].category,
                answer: currentAnswer.trim()
            }
        ];

        setAnswers(updatedAnswers);

        if (currentQuestion >= questions.length) {
            localStorage.setItem(
                "interviewAnswers",
                JSON.stringify(updatedAnswers)
            );

            navigate("/interview/result");
            return;
        }

        setCurrentQuestion((prev) => prev + 1);
        setAnswer("");
        setTimeLeft(120);
    };

    const handleSubmit = () => {
        if (!answer.trim()) {
            alert("Please provide an answer before continuing.");
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            handleNext(answer);
        }, 500);
    };

    const handleExit = () => {
        const confirmExit = window.confirm(
            "Are you sure you want to exit the interview? Your current progress will be lost."
        );

        if (confirmExit) {
            localStorage.removeItem("interviewAnswers");
            navigate("/dashboard");
        }
    };

    if (!config) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Preparing your interview...</p>
            </div>
        );
    }

    const question = questions[currentQuestion - 1];

    return (
        <div className="interview-page">

            {/* Header */}
            <header className="interview-header">

                <div className="interview-brand">
                    <div className="brand-icon">IQ</div>

                    <div>
                        <strong>InterviewIQ</strong>
                        <span>AI Interview</span>
                    </div>
                </div>

                <div className="interview-progress">
                    Question {currentQuestion} of {questions.length}
                </div>

                <div className="timer">
                    ⏱ {formatTime()}
                </div>

            </header>

            {/* Progress Bar */}
            <div className="progress-container">
                <div
                    className="progress-bar"
                    style={{
                        width: `${
                            (currentQuestion / questions.length) * 100
                        }%`
                    }}
                ></div>
            </div>

            {/* Main */}
            <main className="interview-main">

                {/* Interview Info */}
                <div className="interview-info">

                    <div>
                        <span className="question-category">
                            {question.category}
                        </span>

                        <h1>Question {currentQuestion}</h1>
                    </div>

                    <div className="interview-details">
                        <span>{config.role}</span>
                        <span>•</span>
                        <span>{config.experienceLevel}</span>
                        <span>•</span>
                        <span>{config.difficulty}</span>
                    </div>

                </div>

                {/* AI Question */}
                <section className="question-card">

                    <div className="ai-avatar">
                        🤖
                    </div>

                    <div className="question-content">

                        <span>AI Interviewer</span>

                        <h2>
                            {question.question}
                        </h2>

                    </div>

                </section>

                {/* Answer */}
                <section className="answer-section">

                    <div className="answer-header">

                        <h3>Your Answer</h3>

                        <span>
                            {answer.length} characters
                        </span>

                    </div>

                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={isSubmitting}
                    />

                    <p className="answer-tip">
                        💡 Tip: Structure your answer clearly and provide
                        specific examples where possible.
                    </p>

                </section>

                {/* Controls */}
                <div className="interview-controls">

                    <button
                        className="exit-btn"
                        onClick={handleExit}
                        disabled={isSubmitting}
                    >
                        Exit Interview
                    </button>

                    <button
                        className="submit-answer-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : currentQuestion === questions.length
                            ? "Finish Interview"
                            : "Submit Answer →"}
                    </button>

                </div>

            </main>

        </div>
    );
}

export default Interview;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Resume upload states
    const [resume, setResume] = useState(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [resumeMessage, setResumeMessage] = useState("");
    const [resumeError, setResumeError] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const profileResponse = await fetch(
                    "http://localhost:5000/api/auth/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const profileData =
                    await profileResponse.json();

                if (profileData.success) {
                    setUser(profileData.user);
                }

                const interviewResponse = await fetch(
                    "http://localhost:5000/api/interviews",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const interviewData =
                    await interviewResponse.json();

                if (interviewData.success) {
                    setInterviews(
                        interviewData.interviews
                    );
                }

            } catch (error) {
                console.error(
                    "Dashboard error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboard();
        } else {
            setLoading(false);
            navigate("/login");
        }
    }, [token, navigate]);


    // Handle resume selection
    const handleResumeChange = (event) => {
        const selectedFile =
            event.target.files[0];

        setResumeMessage("");
        setResumeError("");

        if (!selectedFile) {
            setResume(null);
            return;
        }

        // Check PDF
        if (
            selectedFile.type !==
            "application/pdf"
        ) {
            setResumeError(
                "Only PDF resume files are allowed."
            );

            setResume(null);
            return;
        }

        // Check file size - 5 MB
        if (
            selectedFile.size >
            5 * 1024 * 1024
        ) {
            setResumeError(
                "Resume file must be smaller than 5 MB."
            );

            setResume(null);
            return;
        }

        setResume(selectedFile);
    };


    // Upload resume
    const handleResumeUpload = async () => {
        if (!resume) {
            setResumeError(
                "Please select a PDF resume first."
            );
            return;
        }

        setUploadingResume(true);
        setResumeMessage("");
        setResumeError("");

        try {
            const formData =
                new FormData();

            formData.append(
                "resume",
                resume
            );

            const response =
                await fetch(
                    "http://localhost:5000/api/resumes/upload",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                setResumeError(
                    data.message ||
                        "Resume upload failed."
                );

                return;
            }

            setResumeMessage(
                "Resume uploaded successfully! 🎉"
            );

            setResume(null);

            // Reset file input
            const fileInput =
                document.getElementById(
                    "resume-upload"
                );

            if (fileInput) {
                fileInput.value = "";
            }

        } catch (error) {
            console.error(
                "Resume upload error:",
                error
            );

            setResumeError(
                "Unable to upload resume. Please try again."
            );

        } finally {
            setUploadingResume(false);
        }
    };


    const handleLogout = () => {
        localStorage.removeItem("token");

        localStorage.removeItem(
            "currentInterviewId"
        );

        localStorage.removeItem(
            "interviewConfig"
        );

        navigate("/login");
    };


    const handleStartInterview = () => {
        navigate("/interview/setup");
    };


    const handleViewInterview = (
        interviewId
    ) => {
        localStorage.setItem(
            "currentInterviewId",
            interviewId
        );

        navigate(
            "/interview/result"
        );
    };


    if (loading) {
        return (
            <div className="dashboard-loading">

                <div className="loader"></div>

                <p>
                    Loading your dashboard...
                </p>

            </div>
        );
    }


    return (
        <div className="dashboard">

            {/* Navbar */}

            <header className="dashboard-header">

                <div className="brand">

                    <div className="brand-icon">
                        IQ
                    </div>

                    <div>

                        <h1>
                            InterviewIQ
                        </h1>

                        <span>
                            AI Interview Preparation
                        </span>

                    </div>

                </div>


                <div className="header-actions">

                    <div className="credits">

                        <span>
                            ⚡
                        </span>

                        <div>

                            <small>
                                Credits
                            </small>

                            <strong>
                                {user?.credits ?? 0}
                            </strong>

                        </div>

                    </div>


                    <button
                        className="logout-btn"
                        onClick={
                            handleLogout
                        }
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* Main Content */}

            <main className="dashboard-main">

                {/* Welcome */}

                <section className="welcome-section">

                    <div className="welcome-content">

                        <span className="welcome-badge">
                            AI-Powered Practice
                        </span>

                        <h2>
                            Welcome back,{" "}
                            <span>
                                {user?.name ||
                                    "Candidate"}
                            </span>{" "}
                            👋
                        </h2>

                        <p>
                            Practice realistic
                            interviews, improve your
                            answers, and become
                            interview-ready.
                        </p>


                        <button
                            className="start-btn"
                            onClick={
                                handleStartInterview
                            }
                        >
                            Start New Interview
                            <span>
                                →
                            </span>
                        </button>

                    </div>


                    <div className="welcome-visual">

                        <div className="visual-circle">

                            <span>
                                🎯
                            </span>

                        </div>

                    </div>

                </section>


                {/* Resume Upload */}

                <section className="resume-section">

                    <div className="resume-card">

                        <div className="resume-icon">
                            📄
                        </div>


                        <div className="resume-content">

                            <h2>
                                Upload Your Resume
                            </h2>

                            <p>
                                Upload your latest
                                resume so InterviewIQ
                                can generate
                                personalized interview
                                questions.
                            </p>


                            <div className="resume-upload-area">

                                <input
                                    id="resume-upload"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={
                                        handleResumeChange
                                    }
                                />


                                <label
                                    htmlFor="resume-upload"
                                    className="resume-file-label"
                                >
                                    📎{" "}
                                    {resume
                                        ? resume.name
                                        : "Choose PDF Resume"}
                                </label>


                                {resume && (
                                    <button
                                        className="resume-upload-btn"
                                        onClick={
                                            handleResumeUpload
                                        }
                                        disabled={
                                            uploadingResume
                                        }
                                    >
                                        {uploadingResume
                                            ? "Uploading..."
                                            : "Upload Resume"}
                                    </button>
                                )}

                            </div>


                            <small className="resume-note">
                                PDF only • Maximum
                                size 5 MB
                            </small>


                            {resumeMessage && (
                                <p className="resume-success">
                                    {resumeMessage}
                                </p>
                            )}


                            {resumeError && (
                                <p className="resume-error">
                                    {resumeError}
                                </p>
                            )}

                        </div>

                    </div>

                </section>


                {/* Stats */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <span className="stat-icon">
                            🎤
                        </span>

                        <div>

                            <p>
                                Total Interviews
                            </p>

                            <h3>
                                {interviews.length}
                            </h3>

                        </div>

                    </div>


                    <div className="stat-card">

                        <span className="stat-icon">
                            ⚡
                        </span>

                        <div>

                            <p>
                                Available Credits
                            </p>

                            <h3>
                                {user?.credits ?? 0}
                            </h3>

                        </div>

                    </div>


                    <div className="stat-card">

                        <span className="stat-icon">
                            🚀
                        </span>

                        <div>

                            <p>
                                Practice Goal
                            </p>

                            <h3>
                                Keep Going
                            </h3>

                        </div>

                    </div>

                </section>


                {/* Recent Interviews */}

                <section className="interviews-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Recent Interviews
                            </h2>

                            <p>
                                Your previous interview
                                sessions
                            </p>

                        </div>

                    </div>


                    {interviews.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                🎤
                            </div>

                            <h3>
                                No interviews yet
                            </h3>

                            <p>
                                Start your first
                                AI-powered interview
                                and see your results
                                here.
                            </p>

                            <button
                                className="empty-start-btn"
                                onClick={
                                    handleStartInterview
                                }
                            >
                                Start Your First Interview
                            </button>

                        </div>

                    ) : (

                        <div className="interview-grid">

                            {interviews.map(
                                (interview) => (

                                    <div
                                        className="interview-card"
                                        key={
                                            interview._id
                                        }
                                    >

                                        <div className="card-top">

                                            <div className="role-icon">
                                                💼
                                            </div>

                                            <span
                                                className={`status ${interview.status?.toLowerCase()}`}
                                            >
                                                {
                                                    interview.status
                                                }
                                            </span>

                                        </div>


                                        <h3>
                                            {
                                                interview.role
                                            }
                                        </h3>


                                        <p className="interview-level">
                                            {
                                                interview.experienceLevel
                                            }
                                            {" • "}
                                            {
                                                interview.difficulty
                                            }
                                        </p>


                                        <div className="card-info">

                                            <span>
                                                ❓{" "}
                                                {
                                                    interview
                                                        .questions
                                                        ?.length ||
                                                    0
                                                }{" "}
                                                Questions
                                            </span>

                                            {interview.status ===
                                                "completed" && (
                                                <span>
                                                    🎯{" "}
                                                    {
                                                        interview
                                                            .overallScore
                                                    }
                                                    /100
                                                </span>
                                            )}

                                        </div>


                                        {interview.status ===
                                            "completed" && (
                                            <button
                                                className="view-result-btn"
                                                onClick={() =>
                                                    handleViewInterview(
                                                        interview._id
                                                    )
                                                }
                                            >
                                                View Results →
                                            </button>
                                        )}

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;
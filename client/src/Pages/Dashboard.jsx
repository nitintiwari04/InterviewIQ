import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

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

                const profileData = await profileResponse.json();

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

                const interviewData = await interviewResponse.json();

                if (interviewData.success) {
                    setInterviews(interviewData.interviews);
                }

            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboard();
        } else {
            setLoading(false);
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("currentInterviewId");
        localStorage.removeItem("interviewConfig");

        navigate("/login");
    };

    const handleStartInterview = () => {
        navigate("/interview/setup");
    };

    const handleViewInterview = (interview) => {
        localStorage.setItem(
            "currentInterviewId",
            interview._id
        );

        navigate("/interview/result");
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">

            {/* NAVBAR */}

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
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* MAIN */}

            <main className="dashboard-main">

                {/* WELCOME */}

                <section className="welcome-section">

                    <div className="welcome-content">

                        <span className="welcome-badge">
                            AI-Powered Practice
                        </span>

                        <h2>
                            Welcome back,{" "}
                            <span>
                                {user?.name || "Candidate"}
                            </span>{" "}
                            👋
                        </h2>

                        <p>
                            Practice realistic interviews, improve your
                            answers, and become interview-ready.
                        </p>


                        <button
                            className="start-btn"
                            onClick={handleStartInterview}
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


                {/* STATS */}

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


                {/* INTERVIEW HISTORY */}

                <section className="interviews-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Recent Interviews
                            </h2>

                            <p>
                                Your previous interview sessions
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
                                Start your first AI-powered interview
                                and see your results here.
                            </p>

                            <button
                                className="empty-start-btn"
                                onClick={handleStartInterview}
                            >
                                Start Your First Interview
                            </button>

                        </div>

                    ) : (

                        <div className="interview-grid">

                            {interviews.map((interview) => (

                                <div
                                    className="interview-card"
                                    key={interview._id}
                                    onClick={() =>
                                        handleViewInterview(interview)
                                    }
                                >

                                    <div className="card-top">

                                        <div className="role-icon">
                                            💼
                                        </div>


                                        <span
                                            className={`status ${interview.status?.toLowerCase()}`}
                                        >
                                            {interview.status}
                                        </span>

                                    </div>


                                    <h3>
                                        {interview.role}
                                    </h3>


                                    <p className="interview-level">

                                        {interview.experienceLevel}
                                        {" • "}
                                        {interview.difficulty}

                                    </p>


                                    <div className="card-info">

                                        <span>
                                            ❓{" "}
                                            {interview.questions?.length || 0}
                                            {" "}Questions
                                        </span>


                                        <span>
                                            🎯{" "}
                                            {interview.overallScore || 0}
                                            /100
                                        </span>

                                    </div>


                                    <div className="view-result">
                                        View Result →
                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;
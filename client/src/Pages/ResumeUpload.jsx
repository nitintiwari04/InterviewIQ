import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResumeUpload() {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        setError("");
        setMessage("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (selectedFile.type !== "application/pdf") {
            setError("Please select a PDF file.");
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select your resume first.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const formData = new FormData();

            formData.append("resume", file);

            const response = await fetch(
                "http://localhost:5000/api/resumes/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(
                    data.message || "Resume upload failed."
                );
                return;
            }

            setMessage(
                "Resume uploaded and analyzed successfully!"
            );

            setTimeout(() => {
                navigate("/interview/setup");
            }, 1200);

        } catch (error) {
            console.error("Resume Upload Error:", error);
            setError("Unable to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resume-page">

            <header className="setup-header">

                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

                <div className="setup-brand">
                    <div className="brand-icon">
                        IQ
                    </div>

                    <span>
                        InterviewIQ
                    </span>
                </div>

            </header>

            <main className="resume-main">

                <div className="resume-title">

                    <span className="setup-badge">
                        AI Resume Analysis
                    </span>

                    <h1>
                        Upload Your Resume
                    </h1>

                    <p>
                        Upload your resume so InterviewIQ can
                        generate personalized interview questions.
                    </p>

                </div>

                <form
                    className="resume-card"
                    onSubmit={handleUpload}
                >

                    <div className="upload-area">

                        <div className="upload-icon">
                            📄
                        </div>

                        <h2>
                            Select your resume
                        </h2>

                        <p>
                            PDF files only
                        </p>

                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                        />

                    </div>

                    {file && (
                        <div className="selected-file">
                            <strong>
                                Selected Resume
                            </strong>

                            <p>
                                {file.name}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="start-interview-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Uploading & Analyzing..."
                            : "Upload Resume →"}
                    </button>

                </form>

            </main>

        </div>
    );
}

export default ResumeUpload;
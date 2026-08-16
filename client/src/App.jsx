import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./Pages/Dashboard";
import InterviewSetup from "./Pages/InterviewSetup";
import Interview from "./Pages/Interview";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Default */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                {/* Dashboard */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                {/* Interview Setup */}
                <Route
                    path="/interview/setup"
                    element={<InterviewSetup />}
                />

                {/* Actual Interview */}
                <Route
                    path="/interview"
                    element={<Interview />}
                />

                {/* Unknown URL */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
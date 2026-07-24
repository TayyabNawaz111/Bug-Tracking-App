import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import NotificationsPage from "./pages/NotificationsPage";
import StatusPage from "./pages/StatusPage";
import BugsPage from "./pages/BugsPage";
import BugDetailPage from "./pages/BugDetailPage";
import { ThemeToggle } from "./components/ThemeToggle";

function App() {
  const [isSignIn, setIsSignIn] = useState(false);
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRoleId = localStorage.getItem("roleId");

    if (token && savedRoleId) {
      setIsSignIn(true);
      setRoleId(parseInt(savedRoleId, 10));
    }
  }, []);

  return (
    <>
      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
        <ThemeToggle />
      </div>
      <Router>
        <Routes>
          {!isSignIn ? (
            <>
              <Route
                path="/"
                element={<SignIn setIsSignIn={setIsSignIn} setRoleId={setRoleId} />}
              />
              <Route
                path="/signup"
                element={<SignUp setIsSignIn={setIsSignIn} setRoleId={setRoleId} />}
              />
              {/* Catch-all to SignIn */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route
                path="/dashboard"
                element={
                  <Dashboard roleId={roleId} setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
                }
              />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/bugs" element={<BugsPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/bugDetailPage/:bugId" element={<BugDetailPage />} />
              {/* Catch-all to Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </Router>
    </>
  );
}

export default App;
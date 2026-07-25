import React, { useState } from "react";
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
import KanbanPage from "./pages/KanbanPage";
import { ThemeToggle } from "./components/ThemeToggle";

function App() {
  // Initialize synchronously from localStorage so a page refresh
  // never triggers the unauthenticated catch-all redirect.
  const [isSignIn, setIsSignIn] = useState(() => {
    const token = localStorage.getItem("token");
    const savedRoleId = localStorage.getItem("roleId");
    return !!(token && savedRoleId);
  });
  const [roleId, setRoleId] = useState(() => {
    const savedRoleId = localStorage.getItem("roleId");
    return savedRoleId ? parseInt(savedRoleId, 10) : null;
  });

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
              <Route
                path="/kanban"
                element={<KanbanPage setIsSignIn={setIsSignIn} setRoleId={setRoleId} />}
              />
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
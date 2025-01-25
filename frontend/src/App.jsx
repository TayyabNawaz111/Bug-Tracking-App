import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import AdminDashboard from "./pages/AdminDashboard";
import DevDashboard from "./pages/DevDashboard";
import TesterDashboard from "./pages/TesterDashboard";
import ProjectsPage from "./pages/ProjectsPage";
import NotificationsPage from "./pages/NotificationsPage";
import StatusPage from "./pages/StatusPage";
import BugsPage from "./pages/BugsPage";

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

  // Map roleId to a dashboard component
  const DashboardComponent = () => {
    switch (roleId) {
      case 1:
        return (
          <AdminDashboard setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
        );
      case 2:
        return <DevDashboard setIsSignIn={setIsSignIn} setRoleId={setRoleId} />;
      case 3:
        return (
          <TesterDashboard setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
        );
      default:
        return <Navigate to="/" />;
    }
  };

  return (
    <Router>
      <Routes>
        {!isSignIn ? (
          <>
            <Route
              path="/"
              element={
                <SignIn setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
              }
            />
            <Route
              path="/signup"
              element={
                <SignUp setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
              }
            />
            {/* Catch-all to SignIn */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<DashboardComponent />} />
            {/* Catch-all to Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}

        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/bugs" element={<BugsPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

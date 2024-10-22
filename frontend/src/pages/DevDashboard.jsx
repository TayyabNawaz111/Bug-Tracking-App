import React from "react";
import { useNavigate } from "react-router-dom";
import Logout from "../components/Logout";

function DevDashboard({ setIsSignIn, setRoleId }) {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        {/* Logout Button */}
        <Logout setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Projects Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          <p>Track your projects and progress.</p>
          <button
            onClick={() => navigate("/projects")} // Navigate to Projects page
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            View Projects
          </button>
        </div>

        {/* Assigned Bugs Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Assigned Bugs</h2>
          <p>View and manage bugs assigned to you.</p>
          <button
            onClick={() => navigate("/bugs")} // Navigate to Bugs page
            className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
          >
            View Bugs
          </button>
        </div>

        {/* Notifications Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <p>View notifications for bug assignment and updates.</p>
          <button
            onClick={() => navigate("/notifications")} // Navigate to Notifications page
            className="mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
          >
            View Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

export default DevDashboard;

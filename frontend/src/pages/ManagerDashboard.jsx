import React from "react";
import Logout from "../components/Logout";

function ManagerDashboard({ setIsSignIn, setRoleId }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Manager Dashboard</h1>
        <Logout setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Project Overview Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
          <p>Get an overview of all active projects.</p>
          <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            View Projects
          </button>
        </div>

        {/* Team Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Team Management</h2>
          <p>Manage your project teams and team members.</p>
          <button className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
            Manage Teams
          </button>
        </div>

        {/* Bug Reports Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bug Reports</h2>
          <p>View and manage bug reports for your projects.</p>
          <button className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
            View Bug Reports
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;

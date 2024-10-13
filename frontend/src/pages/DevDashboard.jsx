import React from "react";
import Logout from "../components/Logout";

function DevDashboard({ setIsSignIn, setRoleId }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        {/* Logout Button */}
        <Logout setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assigned Bugs Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Assigned Bugs</h2>
          <p>View and manage bugs assigned to you.</p>
          <button className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600">
            View Bugs
          </button>
        </div>

        {/* Active Projects Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
          <p>Track your active projects and progress.</p>
          <button className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
            View Projects
          </button>
        </div>

        {/* Bug Status Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bug Status</h2>
          <p>Update the status of bugs you're working on.</p>
          <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Update Status
          </button>
        </div>

        {/* Notifications Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <p>View notifications for bug assignment and updates.</p>
          <button className="mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
            View Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

export default DevDashboard;

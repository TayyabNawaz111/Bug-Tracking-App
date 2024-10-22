import React from "react";
import Logout from "../components/Logout";

function AdminDashboard({ setIsSignIn, setRoleId }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Logout setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Users Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <p>View, edit, and remove users in the system.</p>
          <button className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
            Manage Users
          </button>
        </div>

        {/* Manage Roles Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manage Roles</h2>
          <p>Assign and update user roles and permissions.</p>
          <button className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600">
            Manage Roles
          </button>
        </div>

        {/* System Settings Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <p>Update system-wide configurations and settings.</p>
          <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            System Settings
          </button>
        </div>

        {/* Activity Logs Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
          <p>View recent activity logs for monitoring purposes.</p>
          <button className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

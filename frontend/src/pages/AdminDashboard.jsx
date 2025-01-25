import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logout from "../components/Logout";
import { API_URL } from "../config/config";

function AdminDashboard({ setIsSignIn, setRoleId }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  // Fetch all users when the component loads
  useEffect(() => {
    axios
      .get(`${API_URL}/users`)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Function to handle deleting a user
  const handleDeleteUser = (userId) => {
    axios
      .delete(`${API_URL}/users/${userId}`)
      .then(() => {
        setUsers(users.filter((user) => user.id !== userId));
        alert("User deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      });
  };

  // Open modal and set selected user for editing
  const handleManageUser = (user) => {
    setSelectedUser(user);
    setUpdatedName(user.name); // Set the name to be edited
    setIsModalOpen(true); // Open the modal
  };

  // Function to handle saving the updated user name
  const handleSaveName = () => {
    // Send the user id and updated name in the request body
    axios
      .put(`${API_URL}/users/updateUsername`, { id: selectedUser.id, name: updatedName }) // Sending both id and name
      .then(() => {
        // Update the name in the UI
        setUsers(users.map((user) =>
          user.id === selectedUser.id ? { ...user, name: updatedName } : user
        ));
        alert("User name updated successfully");
        setIsModalOpen(false);  // Close the modal
      })
      .catch((error) => {
        console.error("Error updating user name:", error);
        alert("Failed to update user name");
      });
  };
  

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

          {/* List all users */}
          <ul>
            {users.map((user) => (
              <li key={user.id} className="flex justify-between items-center mb-2">
                <span>{user.name}</span>
                <button
                  className="ml-4 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                  onClick={() => handleManageUser(user)}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Activity Logs Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
          <p>View recent activity logs for monitoring purposes.</p>
          <button
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            onClick={() => navigate("/notifications")}
          >
            View Logs
          </button>
        </div>
      </div>

      {/* Modal for editing user */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4">Edit User Name</h2>
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="border p-2 mb-4 w-full"
            />
            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                onClick={() => setIsModalOpen(false)} // Close the modal
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={handleSaveName} // Save the updated name
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logout from "../components/Logout";
import { API_URL } from "../config/config";

function DevDashboard({ setIsSignIn, setRoleId }) {
  const navigate = useNavigate(); // Hook for navigation
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleCreateProject = async () => {
    const { title, description, endDate } = newProject;

    if (title && description && endDate) {
      try {
        // Making an API call to create a new project
        const response = await axios.post(
          `${API_URL}/projects/createProject`, // Adjust the URL if necessary
          {
            title,
            description,
            endDate,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Replace with the actual token
            },
          }
        );

        console.log("Project created successfully:", response.data);

        // Reset the form after project creation
        setNewProject({
          title: "",
          description: "",
          endDate: "",
        });
        setIsModalOpen(false); // Close modal after creation
      } catch (error) {
        console.error("Error creating project:", error);
        alert(
          "Error creating project: " +
            (error.response ? error.response.data.message : error.message)
        );
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        {/* Logout Button */}
        <Logout setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Project Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create Project</h2>
          <p>Click here to create new project</p>
          <button
            onClick={() => setIsModalOpen(true)} // Open modal
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Create New Project
          </button>
        </div>

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

      {/* Modal for Creating New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <input
              type="text"
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
              className="border border-gray-300 rounded py-2 px-4 mb-4 w-full"
            />
            <textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className="border border-gray-300 rounded py-2 px-4 mb-4 w-full"
              rows="3"
            />
            <p> Enter end date </p>
            <input
              type="date"
              value={newProject.endDate}
              onChange={(e) =>
                setNewProject({ ...newProject, endDate: e.target.value })
              }
              className="border border-gray-300 rounded py-2 px-4 mb-4 w-full"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={handleCreateProject} // Handle project creation
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Create Project
              </button>
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevDashboard;

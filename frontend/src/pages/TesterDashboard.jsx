import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logout from "../components/Logout";
import { API_URL } from "../config/config";

function TesterDashboard({ setIsSignIn, setRoleId }) {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);

  // Fetch all bugs assigned to the tester
  useEffect(() => {
    axios
      .get(`${API_URL}/tickets/AllTickets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => setBugs(response.data))
      .catch((error) => console.error("Error fetching bugs:", error));
  }, []);

  // Function to navigate to the bug details page
  const handleViewBugDetails = (bugId) => {
    navigate(`/bugDetailPage/${bugId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">QA Tester Dashboard</h1>
        <Logout setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
      </div>

      {bugs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bugs.map((bug) => (
            <div
              key={bug.id}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-700">{bug.title}</h3>
              <p className="text-gray-600 mb-4">{bug.description}</p>
              <button
                className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                onClick={() => handleViewBugDetails(bug.id)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No bugs assigned to you yet.</p>
      )}
    </div>
  );
}

export default TesterDashboard;
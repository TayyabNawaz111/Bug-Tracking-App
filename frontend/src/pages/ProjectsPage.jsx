import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/config";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  // Fetch assigned projects when the component mounts
  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/project-users/assignedProjects`, // Corrected endpoint name
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Use JWT token for authentication
            },
          }
        );
        console.log(response.data);
        setProjects(response.data); // Set the fetched projects to state
      } catch (err) {
        setError("Error fetching assigned projects");
      }
    };

    fetchAssignedProjects();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Assigned Projects</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!error && (
        <>
          {projects.length === 0 && (
            <p className="text-gray-600 text-center">
              No projects assigned to you yet.
            </p>
          )}

          {projects.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="bg-white shadow-md rounded-lg p-6 transition duration-300 transform hover:scale-105"
                >
                  <h5 className="text-xl font-semibold mb-2 text-gray-800">
                    {project.title}
                  </h5>
                  <p className="text-gray-600">{project.description}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default ProjectsPage;

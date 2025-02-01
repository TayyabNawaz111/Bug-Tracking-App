import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/config";

function BugDetailPage() {
  const { bugId } = useParams();
  const navigate = useNavigate();
  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);

  // Fetch bug details and comments
  useEffect(() => {
    axios
      .get(`${API_URL}/tickets/${bugId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => setBug(response.data))
      .catch((error) => console.error("Error fetching bug details:", error));

    axios
      .get(`${API_URL}/comments/${bugId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => setComments(response.data))
      .catch((error) => console.error("Error fetching comments:", error));
  }, [bugId]);

  // Convert file to Base64 and submit comment
  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      alert("Please add a comment.");
      return;
    }
  
    const formData = new FormData();
    formData.append("content", comment);
    if (file) {
      formData.append("file", file); // Attach the file
    }
  
    try {
      await axios.post(`${API_URL}/comments/${bugId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert("Comment added successfully");
      setComments((prev) => [...prev, { content: comment, fileUrl: file ? `/uploads/${file.name}` : null }]);
      setComment(""); // Clear comment input
      setFile(null); // Clear file input
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    }
  };

  if (!bug)
    return (
      <div className="text-center text-gray-700">Loading bug details...</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bug Details</h1>
        <button
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          onClick={() => navigate("/tester-dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{bug.title}</h2>
        <p className="text-gray-600 mb-4">
          <strong>Description:</strong> {bug.description}
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Status:</strong> {bug.status}
        </p>

        {/* Add Comment Section */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Add Comment</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add your comment here..."
          ></textarea>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={handleCommentSubmit}
          >
            Submit Comment
          </button>
        </div>

        {/* Display Comments */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Comments</h3>
          {comments.length > 0 ? (
            <ul>
              {comments.map((c, index) => (
                <li
                  key={index}
                  className="border-t py-2 flex justify-between items-center"
                >
                  <p>{c.content}</p>
                  {c.fileUrl && (
                    <a
                      href={`http://localhost:8000${c.fileUrl}`}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      Download File
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BugDetailPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/config";

function BugDetailPage() {
  const { bugId } = useParams();
  const navigate = useNavigate();
  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentFile, setCommentFile] = useState(null);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentMessageType, setCommentMessageType] = useState("success");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const commentsRes = await axios.get(`${API_URL}/comments/${bugId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchBugData = async () => {
    try {
      const token = localStorage.getItem("token");
      const bugRes = await axios.get(`${API_URL}/tickets/${bugId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBug(bugRes.data);
      await fetchComments();
    } catch (err) {
      console.error("Error fetching bug details or comments:", err);
    }
  };

  useEffect(() => {
    fetchBugData();
  }, [bugId]);

  const handleCommentFileChange = (e) => {
    setCommentFile(e.target.files?.[0] || null);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      setCommentMessage("Comment cannot be empty.");
      setCommentMessageType("error");
      return;
    }

    setIsCommentSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", commentContent.trim());
      if (commentFile) {
        formData.append("file", commentFile);
      }

      const response = await axios.post(`${API_URL}/comments/${bugId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setCommentMessage(response.data.message || "Comment added successfully.");
      setCommentMessageType("success");
      setCommentContent("");
      setCommentFile(null);
      await fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentMessage(err.response?.data?.message || "Failed to add comment.");
      setCommentMessageType("error");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  if (!bug) return <div className="text-center" style={{ color: "var(--text-primary)" }}>Loading bug details...</div>;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Bug Details</h1>
        <button
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          onClick={() => navigate("/tester-dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: "var(--card-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>{bug.title}</h2>
        <p className="mb-4" style={{ color: "var(--text-primary)" }}>
          <strong>Description:</strong> {bug.description}
        </p>
        <p className="mb-4" style={{ color: "var(--text-primary)" }}>
          <strong>Status:</strong> {bug.status}
        </p>

        <div className="mt-6">
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Add Comment</h3>
          {commentMessage && (
            <div
              className={`rounded-md p-3 mb-4 text-sm ${commentMessageType === "error" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
              style={{ border: "1px solid var(--border)", backgroundColor: commentMessageType === "error" ? "rgba(248, 113, 113, 0.12)" : "rgba(52, 211, 153, 0.16)", color: "var(--text-primary)" }}
            >
              {commentMessage}
            </div>
          )}
          <form onSubmit={handleAddComment} className="space-y-4">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full rounded-md p-3 border"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              rows={4}
            />
            <input
              type="file"
              onChange={handleCommentFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              type="submit"
              disabled={isCommentSubmitting}
              className={`px-4 py-2 rounded text-white ${isCommentSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isCommentSubmitting ? "Adding comment..." : "Add Comment"}
            </button>
          </form>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Comments</h3>
          {comments.length > 0 ? (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="border-t py-3">
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                    {c.User?.name || c.User?.email || "Unknown commenter"}
                    {c.User?.name && c.User?.email ? ` (${c.User.email})` : ""}
                  </p>
                  <p className="text-sm mb-2" style={{ color: "var(--text-primary)" }}>{c.content}</p>
                  {c.fileUrl && (
                    <a href={`${API_URL}${c.fileUrl}`} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" download>
                      Download File
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "var(--text-primary)" }}>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BugDetailPage;

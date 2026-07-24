import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/config";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function BugsPage() {
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [comments, setComments] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [showMyTickets, setShowMyTickets] = useState(
    location.state?.filterMyTickets || false
  );
  const [projectUsers, setProjectUsers] = useState([]);

  // create bug form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [status, setStatus] = useState("Open");
  const [assignedTo, setAssignedTo] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [files, setFiles] = useState([]);
  const [createMessage, setCreateMessage] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        const roleId = Number(localStorage.getItem("roleId"));
        const endpoint = roleId === 1 ? `${API_URL}/tickets/AllTickets` : `${API_URL}/tickets`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAllTickets(response.data || []);
        setTickets(response.data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    const fetchAssignedProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const roleId = Number(localStorage.getItem("roleId"));
        const endpoint = roleId === 1 ? `${API_URL}/projects` : `${API_URL}/project-users/assignedProjects`;
        const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        setProjects(res.data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchAssignedProjects();

    fetchTickets();
  }, []);

  // derive displayed tickets based on selected project and developer ticket filter
  const getUserId = () => {
    let stored = localStorage.getItem("userId");
    if (stored && stored !== "undefined" && stored !== "null") {
      return Number(stored);
    }
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          const uid = decoded.userId || decoded.id;
          if (uid) {
            localStorage.setItem("userId", uid);
            return Number(uid);
          }
        }
      } catch (e) {
        console.error("Error decoding token in BugsPage", e);
      }
    }
    return null;
  };

  const getAssignedId = (t) => {
    if (!t || t.assignedTo == null) return null;
    if (typeof t.assignedTo === "object") return Number(t.assignedTo.id);
    return Number(t.assignedTo);
  };

  useEffect(() => {
    const userId = getUserId();
    let filtered = allTickets;

    if (selectedProjectId) {
      const selectedIdNum = Number(selectedProjectId);
      filtered = filtered.filter((t) => Number(t.projectId) === selectedIdNum);
    }

    if (showMyTickets) {
      filtered = filtered.filter((t) => getAssignedId(t) === userId);
    }

    setTickets(filtered);
  }, [selectedProjectId, allTickets, showMyTickets]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchProjectUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/project-users/${selectedProjectId}/users`, { headers: { Authorization: `Bearer ${token}` } });
        setProjectUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching project users:", err);
      }
    };

    fetchProjectUsers();
  }, [selectedProjectId]);

  const handleFilesChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setCreateMessage("Select a project first.");
      return;
    }
    if (!assignedTo) {
      setCreateMessage("Please select a developer to assign.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("severity", severity);
      formData.append("status", status);
      formData.append("assignedTo", assignedTo);
      if (stepsToReproduce) formData.append("stepsToReproduce", stepsToReproduce);
      files.forEach((f) => formData.append("attachments", f));

      const res = await axios.post(`${API_URL}/tickets/${selectedProjectId}/createTicket`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCreateMessage("Ticket created successfully.");
      // add to tickets list
      setTickets((prev) => [res.data.ticket || res.data, ...prev]);
      // reset form
      setTitle("");
      setDescription("");
      setSeverity("Low");
      setStatus("Open");
      setAssignedTo("");
      setStepsToReproduce("");
      setFiles([]);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setCreateMessage(err.response?.data?.message || "Failed to create ticket.");
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/tickets/${ticketId}/updateStatus`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
      setAllTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const toggleComments = async (ticketId) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/comments/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments((prev) => ({ ...prev, [ticketId]: response.data }));
      setExpandedTicket(ticketId);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleRequestApproval = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/tickets/${ticketId}/requestApproval`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedStatus = res.data.ticket?.status || "Ready for Approval";
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updatedStatus } : t))
      );
      setAllTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updatedStatus } : t))
      );
    } catch (err) {
      console.error("Error requesting approval, trying fallback status update:", err);
      try {
        await handleStatusChange(ticketId, "Ready for Approval");
      } catch (fallbackErr) {
        console.error("Fallback updateStatus error:", fallbackErr);
      }
    }
  };

  const handleApproveTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/tickets/${ticketId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedStatus = res.data.ticket?.status || "Approved";
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updatedStatus } : t))
      );
      setAllTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updatedStatus } : t))
      );
    } catch (err) {
      console.error("Error approving ticket, trying fallback status update:", err);
      try {
        await handleStatusChange(ticketId, "Approved");
      } catch (fallbackErr) {
        console.error("Fallback updateStatus error:", fallbackErr);
      }
    }
  };

  const handleVerify = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/tickets/${ticketId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedStatus = res.data.ticket?.status || "Closed";
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updatedStatus } : t))
      );
      setAllTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updatedStatus } : t))
      );
    } catch (err) {
      console.error("Error verifying ticket, trying fallback status update:", err);
      try {
        await handleStatusChange(ticketId, "Closed");
      } catch (fallbackErr) {
        console.error("Fallback updateStatus error:", fallbackErr);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bugs Page</h1>
      {/* Project selector: choose a project to filter bugs */}
      {projects && projects.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-3">
            <label className="font-medium" style={{ color: "var(--text-primary)" }}>
              Select Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="p-2 rounded-md"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name || p.title || p.id}</option>
              ))}
            </select>
          </div>

          {Number(localStorage.getItem("roleId")) === 2 && (
            <button
              onClick={() => setShowMyTickets((prev) => !prev)}
              className={`px-3 py-2 rounded-md font-medium transition ${showMyTickets ? "bg-blue-600 text-white" : "bg-transparent text-white/80 border border-slate-500 hover:bg-slate-700"}`}
              style={{ borderColor: showMyTickets ? "transparent" : "var(--border)" }}
            >
              {showMyTickets ? "Showing My Tickets" : "My Tickets"}
            </button>
          )}
        </div>
      )}
      <table className="min-w-full rounded-lg shadow-md" style={{ backgroundColor: "var(--card-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
        <thead>
          <tr className="uppercase text-sm font-bold" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
              <td className="py-2 px-4 border-b">ID</td>
              <td className="py-2 px-4 border-b">Title</td>
              <td className="py-2 px-4 border-b">Description</td>
              <td className="py-2 px-4 border-b">Status</td>
              <td className="py-2 px-4 border-b">Severity</td>
              <td className="py-2 px-4 border-b">Actions</td>
              <td className="py-2 px-4 border-b">Expand Comments</td>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <React.Fragment key={ticket.id}>
              <tr className="transition duration-300" style={{ backgroundColor: "var(--card-bg)" }}>
                <td className="py-2 px-4 border-b">{ticket.id}</td>
                <td className="py-2 px-4 border-b">{ticket.title}</td>
                <td className="py-2 px-4 border-b">{ticket.description}</td>

                <td className="py-2 px-4 border-b">
                  {(() => {
                    const status = ticket.status || "Open";
                    let badgeClass = "bg-blue-500/20 text-blue-400 border-blue-500/30";
                    if (status === "In Progress") badgeClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
                    if (status === "Resolved") badgeClass = "bg-purple-500/20 text-purple-400 border-purple-500/30";
                    if (status === "Ready for Approval") badgeClass = "bg-orange-500/20 text-orange-400 border-orange-500/30";
                    if (status === "Approved" || status === "Closed") badgeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

                    return (
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
                        {status}
                      </span>
                    );
                  })()}
                </td>

                <td className="py-2 px-4 border-b">{ticket.severity}</td>

                {/* Actions column: Developers interact ONLY with assigned tickets; Admins/Testers retain full capability */}
                <td className="py-2 px-4 border-b">
                  {(() => {
                    const roleId = Number(localStorage.getItem("roleId"));
                    const userId = getUserId();
                    const status = ticket.status || "Open";
                    const assignedId = getAssignedId(ticket);
                    const isAssignedToMe = userId != null && assignedId === userId;

                    // Developers can ONLY see and click action buttons on tickets assigned to themselves
                    if (roleId === 2) {
                      if (!isAssignedToMe) {
                        return null; // Leave empty for tickets assigned to other developers or unassigned
                      }

                      if (status === "Open" || status === "Opened") {
                        return (
                          <button
                            onClick={() => handleStatusChange(ticket.id, "In Progress")}
                            className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                          >
                            In Progress
                          </button>
                        );
                      }

                      if (status === "In Progress") {
                        return (
                          <button
                            onClick={() => handleStatusChange(ticket.id, "Resolved")}
                            className="px-3 py-1 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm"
                          >
                            Resolved
                          </button>
                        );
                      }

                      if (status === "Resolved") {
                        return (
                          <button
                            onClick={() => handleRequestApproval(ticket.id)}
                            className="px-3 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
                          >
                            Request Approval
                          </button>
                        );
                      }

                      if (status === "Ready for Approval") {
                        return (
                          <span className="text-xs text-amber-400 font-medium">
                            Pending Approval
                          </span>
                        );
                      }

                      if (status === "Approved" || status === "Closed") {
                        return (
                          <span className="text-xs text-emerald-400 font-medium">
                            ✓ Approved
                          </span>
                        );
                      }

                      return null;
                    }

                    // Admin (roleId === 1)
                    if (roleId === 1) {
                      if (status === "Open" || status === "Opened") {
                        return (
                          <button
                            onClick={() => handleStatusChange(ticket.id, "In Progress")}
                            className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                          >
                            In Progress
                          </button>
                        );
                      }
                      if (status === "In Progress") {
                        return (
                          <button
                            onClick={() => handleStatusChange(ticket.id, "Resolved")}
                            className="px-3 py-1 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm"
                          >
                            Resolved
                          </button>
                        );
                      }
                      if (status === "Resolved") {
                        return (
                          <button
                            onClick={() => handleRequestApproval(ticket.id)}
                            className="px-3 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
                          >
                            Request Approval
                          </button>
                        );
                      }
                      if (status === "Ready for Approval") {
                        return (
                          <button
                            onClick={() => handleApproveTicket(ticket.id)}
                            className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                          >
                            Approved
                          </button>
                        );
                      }
                      if (status === "Approved" || status === "Closed") {
                        return (
                          <span className="text-xs text-emerald-400 font-medium">
                            ✓ Approved
                          </span>
                        );
                      }
                    }

                    // Tester (roleId === 3)
                    if (roleId === 3) {
                      if (status === "Ready for Approval") {
                        return (
                          <button
                            onClick={() => handleApproveTicket(ticket.id)}
                            className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                          >
                            Approved
                          </button>
                        );
                      }
                      if (status === "Approved" || status === "Closed") {
                        return (
                          <span className="text-xs text-emerald-400 font-medium">
                            ✓ Approved
                          </span>
                        );
                      }
                    }

                    return null;
                  })()}
                </td>

                {/* Arrow button for toggling comments */}
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => toggleComments(ticket.id)}
                    className="hover:opacity-80"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {expandedTicket === ticket.id ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                </td>
              </tr>

              {/* Comments section (only visible if expanded) */}
              {expandedTicket === ticket.id && (
                <tr>
                  <td colSpan="7" className="p-4 border-t" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)" }}>
                    <h2 className="text-lg font-semibold mb-3">Comments</h2>
                    {comments[ticket.id]?.length > 0 ? (
                      <ul className="space-y-4">
                        {comments[ticket.id].map((comment) => (
                          <li
                            key={comment.id}
                            className="p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                          >
                            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                      {comment.User?.name || comment.User?.email || "Unknown commenter"}
                      {comment.User?.name && comment.User?.email ? ` (${comment.User.email})` : ""}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {comment.content}
                    </p>
                    {comment.fileUrl && (
                      <a
                        href={`http://localhost:8000${comment.fileUrl}`}
                        className="mt-2 inline-block text-blue-500 hover:underline"
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
                      <p style={{ color: "var(--text-primary)" }}>No comments available.</p>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BugsPage;

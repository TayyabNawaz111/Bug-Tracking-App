import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppShell from "../components/AppShell";
import { API_URL } from "../config/config";
import { getStoredRoleId } from "../utils";

function DevDashboard({ setIsSignIn, setRoleId }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [projectMessage, setProjectMessage] = useState("");
  const [projectMessageType, setProjectMessageType] = useState("error");

  const handleCreateProject = async () => {
    const { title, description, endDate } = newProject;

    if (title && description && endDate) {
      try {
        const response = await axios.post(
          `${API_URL}/projects/createProject`,
          { title, description, endDate },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        
        setNewProject({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
        });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error creating project:", error);
        setProjectMessage(
          error.response?.data?.message ||
            "Couldn't create project. Please try again."
        );
        setProjectMessageType("error");
      }
    } else {
      setProjectMessage("Fill in title, description, and end date first.");
      setProjectMessageType("error");
    }
  };

  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const roleId = getStoredRoleId();

    const endpoint = roleId === 3 ? `${API_URL}/tickets/AllTickets` : `${API_URL}/tickets`;

    axios
      .get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setBugs(res.data || []))
      .catch((err) => console.error("Error fetching bugs for DevDashboard:", err));
  }, []);

  const recentByStatus = useMemo(() => {
    const statuses = [
      { key: "Open", label: "Recently opened" },
      { key: "In Progress", label: "Recently in progress" },
      { key: "Resolved", label: "Recently resolved" },
      { key: "Approved", label: "Recently done" },
    ];

    const map = {};
    statuses.forEach((s) => {
      map[s.key] = [...bugs]
        .filter((b) => (b.status || "Open") === s.key)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 5);
    });

    return { list: statuses, map };
  }, [bugs]);

  const tiles = [
    {
      eyebrow: "01 · NEW",
      title: "Create a project",
      body: "Spin up a new project and start tracking issues against it.",
      action: "New project",
      onClick: () => setIsModalOpen(true),
      rail: "var(--accent)",
    },
    {
      eyebrow: "02 · WORKSPACE",
      title: "Your projects",
      body: "Jump back into the projects you're assigned to.",
      action: "View projects",
      onClick: () => navigate("/projects"),
      rail: "var(--severity-low)",
    },
    {
      eyebrow: "03 · ASSIGNED",
      title: "Assigned bugs",
      body: "Bugs waiting on you, sorted by severity.",
      action: "View bugs",
      onClick: () => navigate("/bugs", { state: { filterMyTickets: true } }),
      rail: "var(--severity-high)",
    },
    {
      eyebrow: "04 · ACTIVITY",
      title: "Notifications",
      body: "Assignments, status changes, and new comments.",
      action: "View notifications",
      onClick: () => navigate("/notifications"),
      rail: "var(--severity-medium)",
    },
    {
      eyebrow: "05 · KANBAN",
      title: "My Kanban Board",
      body: "Drag and drop your assigned tickets across Open, In Progress, Resolved, and Approval stages.",
      action: "Open board",
      onClick: () => navigate("/kanban"),
      rail: "#7c3aed",
    },
  ];

  return (
    <AppShell
      title="Developer dashboard"
      roleId={2}
      setIsSignIn={setIsSignIn}
      setRoleId={setRoleId}
    >
      <div className="mb-8">
        {recentByStatus.list.map((s) => (
          <div key={s.key} className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
              {s.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {(recentByStatus.map[s.key] || []).length === 0 && (
                <div className="text-sm text-muted" style={{ color: "var(--text-secondary)" }}>No {s.label.toLowerCase()}.</div>
              )}
              {(recentByStatus.map[s.key] || []).map((bug) => (
                <div key={bug.id} className="rounded-md p-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
                  <div className="font-semibold">{bug.title}</div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{bug.description}</div>
                  <div className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>Updated: {bug.updatedAt ? new Date(bug.updatedAt).toLocaleDateString() : (bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : "N/A")}</div>
                  <div className="mt-2">
                    <button onClick={() => navigate(`/bugDetailPage/${bug.id}`)} className="text-xs font-medium" style={{ color: "var(--accent)" }}>View details →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {projectMessage && (
          <div
            className={`rounded-md p-4 mb-4 text-sm ${projectMessageType === "error" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
            style={{ border: "1px solid var(--border)", backgroundColor: projectMessageType === "error" ? "rgba(248, 113, 113, 0.12)" : "rgba(52, 211, 153, 0.16)", color: projectMessageType === "error" ? "var(--severity-critical)" : "var(--status-resolved)" }}
          >
            {projectMessage}
          </div>
        )}
        {tiles.map((tile) => (
          <div
            key={tile.title}
            className="group rounded-md pl-5 pr-5 py-6 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderLeft: `3px solid ${tile.rail}`,
            }}
          >
            <div>
              <p
                className="text-[11px] uppercase mb-3"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                  color: "var(--text-secondary)",
                }}
              >
                {tile.eyebrow}
              </p>
              <h2
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {tile.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {tile.body}
              </p>
            </div>
            <button
              onClick={tile.onClick}
              className="mt-6 self-start text-sm font-medium transition-colors flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: "var(--accent)" }}
            >
              {tile.action}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: "var(--overlay)" }}
        >
          <div
            className="rounded-lg p-6 w-full max-w-md shadow-xl"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-[11px] uppercase mb-1"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
                color: "var(--text-secondary)",
              }}
            >
              New project
            </p>
            <h2
              className="text-xl font-semibold mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create project
            </h2>

            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Checkout redesign"
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
              className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />

            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Description
            </label>
            <textarea
              placeholder="What's this project for?"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              rows="3"
              className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />

            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              End date
            </label>
            <input
              type="date"
              value={newProject.endDate}
              onChange={(e) =>
                setNewProject({ ...newProject, endDate: e.target.value })
              }
              className="rounded-md py-2 px-3 mb-6 w-full text-sm focus:outline-none"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sm font-medium py-2 px-4 rounded-md transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                style={{ backgroundColor: "var(--accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--accent)")
                }
              >
                Create project
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default DevDashboard;

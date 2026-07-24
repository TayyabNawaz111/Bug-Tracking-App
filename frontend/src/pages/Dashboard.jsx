import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppShell from "../components/AppShell";
import { API_URL } from "../config/config";

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function severityColor(severity) {
  switch (severity) {
    case "Critical":
      return "var(--severity-critical)";
    case "High":
      return "var(--severity-high)";
    case "Medium":
      return "var(--severity-medium)";
    default:
      return "var(--severity-low)";
  }
}

function statusColor(status) {
  switch (status) {
    case "Open":
      return "var(--status-open)";
    case "In Progress":
      return "var(--status-progress)";
    case "Resolved":
      return "var(--status-resolved)";
    default:
      return "var(--status-closed)";
  }
}

function Badge({ label, color }) {
  return (
    <span
      className="text-[11px] font-medium uppercase px-2 py-0.5 rounded"
      style={{
        color,
        backgroundColor: `${color}1a`,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div
      className="rounded-md p-5"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <p
        className="text-[11px] uppercase mb-2"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em", color: "var(--text-secondary)" }}
      >
        {label}
      </p>
      <p className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}

function Dashboard({ roleId, setIsSignIn, setRoleId }) {
  const navigate = useNavigate();

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", endDate: "" });

  const [editingUser, setEditingUser] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [assignMessage, setAssignMessage] = useState("");
  const [assignMessageType, setAssignMessageType] = useState("error");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", roleId: "" });
  const [newUserMessage, setNewUserMessage] = useState("");
  const [newUserMessageType, setNewUserMessageType] = useState("error");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [projectMessage, setProjectMessage] = useState("");
  const [projectMessageType, setProjectMessageType] = useState("error");
  const [editUserMessage, setEditUserMessage] = useState("");
  const [editUserMessageType, setEditUserMessageType] = useState("error");

  const isAdmin = roleId === 1;
  const isDeveloper = roleId === 2;
  const isTester = roleId === 3;

  const roleLabel = isAdmin ? "Admin" : isDeveloper ? "Developer" : "Tester";

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Admins can fetch all tickets; others fetch only assigned tickets
    const ticketsEndpoint = isAdmin ? `${API_URL}/tickets/AllTickets` : `${API_URL}/tickets`;
    axios
      .get(ticketsEndpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setBugs(res.data))
      .catch((err) => console.error("Error fetching bugs:", err));

    if (isAdmin) {
      axios
        .get(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setProjects(res.data))
        .catch((err) => console.error("Error fetching projects:", err));

      axios
        .get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Error fetching users:", err));

      axios
        .get(`${API_URL}/roles`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setRoles(res.data))
        .catch((err) => console.error("Error fetching roles:", err));
    } else {
      axios
        .get(`${API_URL}/project-users/assignedProjects`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setProjects(res.data))
        .catch((err) => console.error("Error fetching projects:", err));
    }
  }, [isAdmin]);

  const openCount = useMemo(() => bugs.filter((b) => b.status !== "Closed" && b.status !== "Resolved").length, [bugs]);
  const criticalCount = useMemo(() => bugs.filter((b) => b.severity === "Critical").length, [bugs]);

  const sortedBugs = useMemo(
    () => [...bugs].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)),
    [bugs]
  );
  const recentBugs = useMemo(() => [...bugs].slice(-5).reverse(), [bugs]);

  const topProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const sorted = [...projects].sort((a, b) => {
      const aDate = a.updatedAt || a.createdAt || 0;
      const bDate = b.updatedAt || b.createdAt || 0;
      return new Date(bDate) - new Date(aDate);
    });
    return sorted.slice(0, 3);
  }, [projects]);

  const recentResolved = useMemo(() => {
    return [...bugs]
      .filter((b) => (b.status || "").toLowerCase() === "resolved")
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
      .slice(0, 5);
  }, [bugs]);

  const handleCreateProject = async () => {
    const { title, description, endDate } = newProject;
    if (!(title && description && endDate)) {
      setProjectMessage("Fill in title, description, and end date first.");
      setProjectMessageType("error");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/projects/createProject`,
        { title, description, endDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setNewProject({ title: "", description: "", endDate: "" });
      setIsModalOpen(false);
      setProjectMessage("Project created successfully.");
      setProjectMessageType("success");
    } catch (error) {
      console.error("Error creating project:", error);
      setProjectMessage(
        error.response?.data?.message || "Couldn't create project. Please try again."
      );
      setProjectMessageType("error");
    }
  };

  const handleDeleteUser = (userId) => {
    axios
      .delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setUsers(users.filter((u) => u.id !== userId));
        setNewUserMessage("User deleted successfully.");
        setNewUserMessageType("success");
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        setNewUserMessage(
          error.response?.data?.message || "Failed to delete user."
        );
        setNewUserMessageType("error");
      });
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.roleId) {
      setNewUserMessage("Please fill in all user fields.");
      setNewUserMessageType("error");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/users/add`,
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          roleId: newUser.roleId,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setUsers([...users, response.data.user]);
      setIsAddUserOpen(false);
      setNewUser({ name: "", email: "", password: "", roleId: "" });
      setNewUserMessage("User added successfully.");
      setNewUserMessageType("success");
      setShowNewUserPassword(false);
    } catch (error) {
      console.error("Error adding user:", error);
      setNewUserMessage(
        error.response?.data?.message || "Failed to add user. Please try again."
      );
      setNewUserMessageType("error");
    }
  };

  const handleAssignUsers = async () => {
    if (!selectedProjectId || selectedUserIds.length === 0) {
      setAssignMessage("Select a project and at least one user.");
      setAssignMessageType("error");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/project-users/${selectedProjectId}/assign`,
        { userIds: selectedUserIds },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setAssignMessage("Users assigned successfully.");
      setAssignMessageType("success");
      setIsAssignUserOpen(false);
      setSelectedProjectId("");
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Error assigning users:", error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      setAssignMessage(serverMsg || error.message || "Failed to assign users. Please try again.");
      setAssignMessageType("error");
    }
  };

  const handleSaveUserName = async () => {
    try {
      await axios.put(
        `${API_URL}/users/updateUsername`,
        { id: editingUser.id, name: updatedName },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (selectedRoleId != null && selectedRoleId !== editingUser.roleId) {
        await axios.post(
          `${API_URL}/users/update-role`,
          { userId: editingUser.id, roleId: selectedRoleId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      }

      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: updatedName, roleId: selectedRoleId ?? u.roleId }
            : u
        )
      );
      setEditingUser(null);
      setSelectedRoleId(null);
      setEditUserMessage("User updated successfully.");
      setEditUserMessageType("success");
    } catch (error) {
      console.error("Error updating user:", error);
      setEditUserMessage(
        error.response?.data?.message || "Failed to update user information."
      );
      setEditUserMessageType("error");
    }
  };

  return (
    <AppShell
      eyebrow={`Workspace / Dashboard`}
      title={`${roleLabel} dashboard`}
      roleId={roleId}
      setIsSignIn={setIsSignIn}
      setRoleId={setRoleId}
    >

      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", padding: "12px", borderRadius: "0.5rem" }}>
          <div>
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)", marginBottom: "4px" }}>
              Total users
            </p>
            <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)", margin: 0 }}>
              {users.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="text-sm font-medium py-2 px-3 rounded-md text-white transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Create users
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium py-2 px-3 rounded-md text-white transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Create projects
            </button>
            
            <button
              onClick={() => navigate("/projects")}
              className="text-sm font-medium py-2 px-3 rounded-md transition-colors"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              View all projects
            </button>
            <button
              onClick={() => navigate("/bugs")}
              className="text-sm font-medium py-2 px-3 rounded-md transition-colors"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              View all bugs
            </button>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Top projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {topProjects.length === 0 && <div className="text-sm text-muted" style={{ color: "var(--text-secondary)" }}>No projects yet.</div>}
            {topProjects.map((p) => (
              <div key={p.id} className="rounded-md p-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{p.description}</div>
                <div className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>Updated: {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A")}</div>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Recently resolved
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentResolved.length === 0 && <div className="text-sm" style={{ color: "var(--text-secondary)" }}>No recently resolved tickets.</div>}
            {recentResolved.map((bug) => (
              <div key={bug.id} className="rounded-md p-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderLeft: `3px solid ${severityColor(bug.severity)}` }}>
                <div className="flex justify-between items-start mb-2">
                  <Badge label={bug.severity} color={severityColor(bug.severity)} />
                  <Badge label={bug.status} color={statusColor(bug.status)} />
                </div>
                <h3 className="text-sm font-semibold mb-1">{bug.title}</h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{bug.description}</p>
                <button onClick={() => navigate(`/bugDetailPage/${bug.id}`)} className="text-xs font-medium" style={{ color: "var(--accent)" }}>View details →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="rounded-md" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Manage users
            </h2>
          </div>
          <ul>
            {users.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center px-5 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {roles.find((r) => r.id === user.roleId)?.name || "Role"}
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setUpdatedName(user.name);
                      setSelectedRoleId(user.roleId);
                    }}
                    className="text-sm font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-sm font-medium"
                    style={{ color: "var(--severity-critical)" }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {users.length === 0 && (
              <li className="px-5 py-6 text-sm text-center" style={{ color: "var(--text-secondary)" }}>
                No users found.
              </li>
            )}
          </ul>
        </div>
      )}

      {isDeveloper && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Assigned to you, by severity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBugs.slice(0, 6).map((bug) => (
              <div
                key={bug.id}
                className="rounded-md p-4"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${severityColor(bug.severity)}`,
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge label={bug.severity} color={severityColor(bug.severity)} />
                  <Badge label={bug.status} color={statusColor(bug.status)} />
                </div>
                <h3 className="text-sm font-semibold mb-1">{bug.title}</h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                  {bug.description}
                </p>
                <button
                  onClick={() => navigate(`/bugDetailPage/${bug.id}`)}
                  className="text-xs font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  View details →
                </button>
              </div>
            ))}
            {sortedBugs.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No bugs assigned to you yet.
              </p>
            )}
          </div>
        </div>
      )}

      {isTester && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Recently reported
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBugs.map((bug) => (
              <div
                key={bug.id}
                className="rounded-md p-4"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${severityColor(bug.severity)}`,
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge label={bug.severity} color={severityColor(bug.severity)} />
                  <Badge label={bug.status} color={statusColor(bug.status)} />
                </div>
                <h3 className="text-sm font-semibold mb-1">{bug.title}</h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                  {bug.description}
                </p>
                <button
                  onClick={() => navigate(`/bugDetailPage/${bug.id}`)}
                  className="text-xs font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  View details →
                </button>
              </div>
            ))}
            {recentBugs.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No bugs reported yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Create project modal — shared, only reachable by Admin/Developer */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: "var(--overlay)" }}>
          <div className="rounded-lg p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
            <h2 className="text-xl font-semibold mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Create project
            </h2>
            {projectMessage && (
              <div
                className={`rounded-md p-3 mb-4 text-sm ${projectMessageType === "error" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                style={{ border: "1px solid var(--border)", backgroundColor: projectMessageType === "error" ? "rgba(248, 113, 113, 0.12)" : "rgba(52, 211, 153, 0.16)", color: projectMessageType === "error" ? "var(--severity-critical)" : "var(--status-resolved)" }}
              >
                {projectMessage}
              </div>
            )}

            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Title
            </label>
            <input
              type="text"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />

            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              rows="3"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />

            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              End date
            </label>
            <input
              type="date"
              value={newProject.endDate}
              onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
              className="rounded-md py-2 px-3 mb-6 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="text-sm font-medium py-2 px-4 rounded-md" style={{ color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={handleCreateProject} className="text-white text-sm font-medium py-2 px-4 rounded-md" style={{ backgroundColor: "var(--accent)" }}>
                Create project
              </button>
            </div>
          </div>
        </div>
      )}

      {isAssignUserOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: "var(--overlay)" }}>
          <div className="rounded-lg p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
            <h2 className="text-xl font-semibold mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Assign users to project
            </h2>
            {assignMessage && (
              <div
                className={`rounded-md p-3 mb-4 text-sm ${assignMessageType === "error" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: assignMessageType === "error" ? "rgba(248, 113, 113, 0.12)" : "rgba(52, 211, 153, 0.16)",
                  color: assignMessageType === "error" ? "var(--severity-critical)" : "var(--status-resolved)",
                }}
              >
                {assignMessage}
              </div>
            )}

            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Select project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Select users
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                  <input
                    type="checkbox"
                    value={user.id}
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => {
                      const userId = Number(e.target.value);
                      setSelectedUserIds((prev) =>
                        e.target.checked
                          ? [...prev, userId]
                          : prev.filter((id) => id !== userId)
                      );
                    }}
                    className="rounded"
                  />
                  {user.name}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAssignUserOpen(false)} className="text-sm font-medium py-2 px-4 rounded-md" style={{ color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={handleAssignUsers} className="text-white text-sm font-medium py-2 px-4 rounded-md" style={{ backgroundColor: "var(--accent)" }}>
                Assign users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit user modal — Admin only */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: "var(--overlay)" }}>
          <div className="rounded-lg p-6 w-full max-w-sm shadow-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Edit user
            </h2>
            {editUserMessage && (
              <div
                className={`rounded-md p-3 mb-4 text-sm ${editUserMessageType === "error" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                style={{ border: "1px solid var(--border)", backgroundColor: editUserMessageType === "error" ? "rgba(248, 113, 113, 0.12)" : "rgba(52, 211, 153, 0.16)", color: editUserMessageType === "error" ? "var(--severity-critical)" : "var(--status-resolved)" }}
              >
                {editUserMessage}
              </div>
            )}
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Name
            </label>
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Role
            </label>
            <select
              value={selectedRoleId ?? ""}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              className="rounded-md py-2 px-3 mb-6 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
              <option value="" disabled>
                Select role
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="text-sm font-medium py-2 px-4 rounded-md" style={{ color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={handleSaveUserName} className="text-white text-sm font-medium py-2 px-4 rounded-md" style={{ backgroundColor: "var(--accent)" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddUserOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: "var(--overlay)" }}>
          <div className="rounded-lg p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Add new user
            </h2>
            {newUserMessage && (
              <div
                className={`rounded-md p-3 mb-4 text-sm ${newUserMessageType === "error" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                style={{ border: "1px solid var(--border)", backgroundColor: newUserMessageType === "error" ? "rgba(248, 113, 113, 0.12)" : "rgba(52, 211, 153, 0.16)", color: newUserMessageType === "error" ? "var(--severity-critical)" : "var(--status-resolved)" }}
              >
                {newUserMessage}
              </div>
            )}
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Name
            </label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showNewUserPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="rounded-md py-2 px-3 mb-4 w-full text-sm focus:outline-none"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              />
              <button
                type="button"
                onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i
                  className={`fas fa-eye${showNewUserPassword ? "" : "-slash"}`}
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
            </div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Role
            </label>
            <select
              value={newUser.roleId}
              onChange={(e) => setNewUser({
                ...newUser,
                roleId: e.target.value ? Number(e.target.value) : "",
              })}
              className="rounded-md py-2 px-3 mb-6 w-full text-sm focus:outline-none"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
              <option value="" disabled>
                Select role
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAddUserOpen(false)} className="text-sm font-medium py-2 px-4 rounded-md" style={{ color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={handleAddUser} className="text-white text-sm font-medium py-2 px-4 rounded-md" style={{ backgroundColor: "var(--accent)" }}>
                Add user
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default Dashboard;


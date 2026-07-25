import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/config";
import { useTheme } from "../context/ThemeContext";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleId, setRoleId] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectDetails, setProjectDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [manageSearch, setManageSearch] = useState("");
  const [manageLoading, setManageLoading] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [createProjectId, setCreateProjectId] = useState(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSeverity, setCreateSeverity] = useState("Low");
  const [createStatus, setCreateStatus] = useState("Open");
  const [createAssignedTo, setCreateAssignedTo] = useState("");
  const [createSteps, setCreateSteps] = useState("");
  const [createFiles, setCreateFiles] = useState([]);
  const [devSearch, setDevSearch] = useState("");
  const [showDevPicker, setShowDevPicker] = useState(false);
  const [devCandidates, setDevCandidates] = useState([]);
  const [createMessage, setCreateMessage] = useState("");
  const { theme } = useTheme();

  const modalBgClass = theme === "dark" ? "bg-slate-900 text-white border border-slate-700" : "bg-white text-gray-900 border border-gray-200";
  const inputClass = theme === "dark"
    ? "bg-slate-800 text-white border border-slate-700 placeholder-gray-400"
    : "bg-white text-black border border-gray-300 placeholder-gray-500";
  const selectClass = theme === "dark"
    ? "bg-slate-800 text-white border border-slate-700"
    : "bg-white text-black border border-gray-300";
  const textareaClass = theme === "dark"
    ? "bg-slate-800 text-white border border-slate-700 placeholder-gray-400"
    : "bg-white text-black border border-gray-300 placeholder-gray-500";
  const pickerButtonClass = theme === "dark"
    ? "border border-slate-700 bg-slate-800 text-white"
    : "border border-gray-300 bg-white text-black";
  const pickerInputClass = theme === "dark"
    ? "bg-slate-700 text-white placeholder-gray-400 border border-slate-600"
    : "bg-white text-black placeholder-gray-500 border border-gray-200";
  const devItemHoverClass = theme === "dark" ? "hover:bg-slate-700" : "hover:bg-gray-100";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rid = Number(localStorage.getItem("roleId"));
    const admin = rid === 1;
    setIsAdmin(admin);
    setRoleId(rid);

    const fetchProjects = async () => {
      try {
        const endpoint = admin ? `${API_URL}/projects` : `${API_URL}/project-users/assignedProjects`;
        const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        setProjects(res.data || []);
      } catch (err) {
        setError(admin ? "Error fetching all projects" : "Error fetching assigned projects");
      }
    };

    fetchProjects();
  }, []);

  const fetchProjectDetails = async (projectId) => {
    const token = localStorage.getItem("token");
    setLoadingDetails((s) => ({ ...s, [projectId]: true }));
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/details`, { headers: { Authorization: `Bearer ${token}` } });
      setProjectDetails((p) => ({ ...p, [projectId]: res.data }));
    } catch (err) {
      // fallback to basic project if detailed endpoint missing
      if (err?.response?.status === 404) {
        try {
          const basic = await axios.get(`${API_URL}/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
          setProjectDetails((p) => ({ ...p, [projectId]: { ...basic.data, ProjectUsers: [], Tickets: [] } }));
        } catch (e) {
          console.error("Fallback project fetch failed", e);
        }
      } else {
        console.error("Error fetching project details:", err);
      }
    } finally {
      setLoadingDetails((s) => ({ ...s, [projectId]: false }));
    }
  };

  const openProjectModal = (projectId) => {
    // close create modal if open
    setIsCreateTicketOpen(false);
    setCreateProjectId(null);
    setSelectedProjectId(projectId);
    if (!projectDetails[projectId]) fetchProjectDetails(projectId);
  };

  const openCreateTicketModal = (projectId) => {
    // close details modal when opening create ticket
    setSelectedProjectId(null);
    setCreateProjectId(projectId);
    if (!projectDetails[projectId]) fetchProjectDetails(projectId).catch(() => {});
    // preload developers assigned to this project for quick selection
    fetchDevCandidates(projectId);
    setIsCreateTicketOpen(true);
    setCreateMessage("");
  };

  const fetchDevCandidates = async (projectId) => {
    if (!projectId) return setDevCandidates([]);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_URL}/project-users/${projectId}/users`, { headers: { Authorization: `Bearer ${token}` } });
      // only keep developers (roleId === 2)
      setDevCandidates((res.data || []).filter((u) => u.roleId === 2));
    } catch (err) {
      console.error("Error fetching developers for project:", err);
      setDevCandidates([]);
    }
  };

  const closeCreateTicketModal = () => {
    setIsCreateTicketOpen(false);
    setCreateProjectId(null);
    setCreateTitle("");
    setCreateDescription("");
    setCreateSeverity("Low");
    setCreateStatus("Open");
    setCreateAssignedTo("");
    setCreateSteps("");
    setCreateFiles([]);
    setDevSearch("");
  };

  const handleCreateFilesChange = (e) => setCreateFiles(Array.from(e.target.files || []));

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const projectId = createProjectId;
    if (!projectId) return setCreateMessage("Select a project first.");
    if (!createAssignedTo) return setCreateMessage("Please select a developer to assign.");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", createTitle);
      formData.append("description", createDescription);
      formData.append("severity", createSeverity);
      formData.append("status", createStatus);
      formData.append("assignedTo", createAssignedTo);
      if (createSteps) formData.append("stepsToReproduce", createSteps);
      createFiles.forEach((f) => formData.append("attachments", f));

      const res = await axios.post(`${API_URL}/tickets/${projectId}/createTicket`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setCreateMessage("Ticket created successfully.");
      // refresh project details to show new ticket count
      fetchProjectDetails(projectId).catch(() => {});
      setTimeout(() => closeCreateTicketModal(), 900);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setCreateMessage(err.response?.data?.message || "Failed to create ticket.");
    }
  };

  const closeProjectModal = () => setSelectedProjectId(null);

  const fetchAllUsers = async () => {
    const token = localStorage.getItem("token");
    setManageLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      setAllUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setManageLoading(false);
    }
  };

  const openManageUsers = (projectId) => {
    setSelectedProjectId(projectId);
    setIsManageUsersOpen(true);
    if (!projectDetails[projectId]) fetchProjectDetails(projectId).catch(() => {});
    if (allUsers.length === 0) fetchAllUsers().catch(() => {});
  };

  const closeManageUsers = () => {
    setIsManageUsersOpen(false);
    setManageSearch("");
  };

  // keyboard close
  useEffect(() => {
    if (!isManageUsersOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeManageUsers(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isManageUsersOpen]);

  const handleAddUserToProject = async (userId, projectId = selectedProjectId) => {
    const token = localStorage.getItem("token");
    if (!projectId) return;
    try {
      await axios.put(`${API_URL}/project-users/${projectId}/assign`, { userIds: [userId] }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchProjectDetails(projectId);
    } catch (err) {
      console.error("Error adding user to project:", err);
    }
  };

  const handleRemoveUserFromProject = async (userId, projectId = selectedProjectId) => {
    const token = localStorage.getItem("token");
    if (!projectId) return;
    try {
      await axios.delete(`${API_URL}/project-users/${projectId}/assign/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchProjectDetails(projectId);
    } catch (err) {
      console.error("Error removing user from project:", err);
    }
  };

  const selectedProjectDetails = selectedProjectId ? projectDetails[selectedProjectId] : null;
  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;
  const assignedUsers = (selectedProjectDetails?.ProjectUsers?.map((pu) => pu.User) || []).filter(Boolean);
  const tickets = selectedProjectDetails?.Tickets || [];
  const createProjectDetails = createProjectId ? projectDetails[createProjectId] : null;
  const createProject = createProjectId ? projects.find((p) => p.id === createProjectId) : null;
  const createAssignedUsers = (createProjectDetails?.ProjectUsers?.map((pu) => pu.User) || []).filter(Boolean);
  const isLoadingSelectedDetails = selectedProjectId ? loadingDetails[selectedProjectId] : false;

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">{isAdmin ? "All Projects" : "Assigned Projects"}</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!error && (
        <>
          {projects.length === 0 && (
            <p className="text-center" style={{ color: "var(--text-primary)" }}>No projects assigned to you yet.</p>
          )}

          {projects.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <li key={project.id} className="shadow-md rounded-lg p-6 transition duration-300 transform hover:scale-105" style={{ backgroundColor: "var(--card-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h5 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{project.title}</h5>
                      <p style={{ color: "var(--text-primary)" }}>{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-sm font-semibold px-3 py-1 rounded-md border" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }} onClick={() => openProjectModal(project.id)}>View details</button>
                      {roleId === 3 && (
                        <button className="text-sm font-semibold px-3 py-1 rounded-md bg-blue-600 text-white" onClick={() => openCreateTicketModal(project.id)}>Create ticket</button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Project details modal */}
      {selectedProjectId && !isCreateTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className={`relative max-h-full w-full max-w-3xl overflow-y-auto rounded-xl p-6 shadow-2xl ${modalBgClass}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-semibold">{selectedProject?.title || "Project details"}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{selectedProject?.description}</p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <button className="rounded-md border px-3 py-1 text-sm font-semibold" onClick={() => openManageUsers(selectedProjectId)} style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>Manage users</button>
                )}
                <button className="rounded-md border px-3 py-1 text-sm font-semibold" onClick={closeProjectModal} style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>Close</button>
              </div>
            </div>

            {isLoadingSelectedDetails ? (
              <div>Loading details...</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
                    <div className="font-semibold mb-2">Project metadata</div>
                    <div>Start date: {selectedProject?.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : "N/A"}</div>
                    <div>End date: {selectedProject?.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : "N/A"}</div>
                  </div>

                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
                    <div className="font-semibold mb-2">Assigned users</div>
                    {assignedUsers.length === 0 ? <div>No users assigned to this project.</div> : (
                      <ul className="list-disc list-inside">
                        {assignedUsers.map((user) => (<li key={user.id}>{user.name || user.email}</li>))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
                  <div className="font-semibold mb-2">Reported bugs</div>
                  <div>Total bugs: {tickets.length}</div>
                </div>
              </>
            )}

          
        </div>
      </div>
      )}

      {/* Create Ticket modal (separate overlay, small) */}
      {isCreateTicketOpen && createProjectId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4 py-6" onClick={closeCreateTicketModal}>
          <div onClick={(e) => e.stopPropagation()} className={`max-h-full w-full max-w-md overflow-y-auto rounded-lg p-4 shadow-2xl ${modalBgClass}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Create ticket for {createProject?.title || "project"}</h3>
              <button className="rounded-md border px-2 py-1 text-sm" onClick={closeCreateTicketModal} style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>Close</button>
            </div>

            {createMessage && <div className="mb-2 text-sm text-green-300">{createMessage}</div>}

            <form onSubmit={handleCreateTicket} className="grid gap-2">
              <div>
                <label className="text-sm">Title</label>
                <input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} className={`w-full rounded p-2 ${inputClass}`} placeholder="Enter title" />
              </div>

              <div>
                <label className="text-sm">Severity</label>
                <select value={createSeverity} onChange={(e) => setCreateSeverity(e.target.value)} className={`w-full rounded p-2 ${selectClass}`}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div>
                <label className="text-sm">Description</label>
                <textarea value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} className={`w-full rounded p-2 ${textareaClass}`} rows={3} />
              </div>

              <div>
                <label className="text-sm">Assign to (developer)</label>
                <div className="relative">
                  <button type="button" className={`w-full text-left rounded p-2 ${pickerButtonClass}`} onClick={async () => {
                    const next = !showDevPicker;
                    setShowDevPicker(next);
                    if (next) await fetchDevCandidates(createProjectId);
                  }}>
                    {createAssignedTo ? (createAssignedUsers.find(u => u.id === createAssignedTo)?.name || createAssignedUsers.find(u => u.id === createAssignedTo)?.email) : "Select developer (click to open)"}
                  </button>

                  {showDevPicker && (
                    <div className={`absolute z-40 mt-1 w-full rounded shadow ${theme === "dark" ? "bg-slate-800 text-white border border-slate-700" : "bg-white text-black border border-gray-200"}`} style={{ maxHeight: 220, overflowY: "auto" }}>
                      <div className="p-2">
                        <input value={devSearch} onChange={(e) => setDevSearch(e.target.value)} placeholder="Search developers by name or email" className={`w-full rounded p-2 mb-2 ${pickerInputClass}`} />
                        <div>
                          {(devCandidates.filter(u => ((devSearch === "") || ((u.name || u.email || "").toLowerCase().includes(devSearch.toLowerCase()))))).map((u) => (
                            <div key={u.id} className={`p-2 ${devItemHoverClass} cursor-pointer`} onClick={() => { setCreateAssignedTo(u.id); setShowDevPicker(false); setDevSearch(""); }}>
                              <div className="text-sm">{u.name || u.email}</div>
                              <div className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>{u.email}</div>
                            </div>
                          ))}
                          {devCandidates.length === 0 && <div className={`p-2 text-sm ${theme === "dark" ? "text-slate-300" : "text-gray-500"}`}>No developers available</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Quick developer chips for visibility and one-click assign */}
                {devCandidates.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {devCandidates.map((d) => (
                      <button key={d.id} type="button" className={`py-1 px-2 rounded text-sm ${createAssignedTo === d.id ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-black'}`} onClick={() => setCreateAssignedTo(d.id)}>
                        {d.name || d.email}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm">Attachments</label>
                <input type="file" multiple onChange={handleCreateFilesChange} className="w-full text-white" />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button className="bg-blue-600 text-white py-2 px-4 rounded" type="submit">Create Ticket</button>
                <button type="button" className="py-2 px-4 border rounded" onClick={closeCreateTicketModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Users submodal — nested so it appears over the details modal */}
      {isManageUsersOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" onClick={closeManageUsers}>
          <div onClick={(e) => e.stopPropagation()} className={`max-h-full w-full max-w-2xl overflow-y-auto rounded-xl p-6 shadow-2xl ${modalBgClass}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage users for {selectedProject?.title || "project"}</h3>
              <div className="flex items-center gap-2">
                <input value={manageSearch} onChange={(e) => setManageSearch(e.target.value)} placeholder="Search users by name or email" className="rounded-md py-2 px-3 text-sm" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }} />
                <button className="rounded-md border px-3 py-1 text-sm" onClick={closeManageUsers} style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>Close</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold mb-2">Assigned users</div>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {assignedUsers.length === 0 && <div className="text-sm">No users assigned to this project.</div>}
                  {assignedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded" style={{ border: "1px solid var(--border)" }}>
                      <div>
                        <div className="text-sm font-medium">{user.name || user.email}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</div>
                      </div>
                      <button className="text-sm text-red-500" onClick={() => handleRemoveUserFromProject(user.id, selectedProjectId)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">All users</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {manageLoading && <div>Loading users...</div>}
                  {allUsers.filter((u) => {
                    if (u.roleId !== 2 && u.roleId !== 3) return false;
                    if (!manageSearch) return true;
                    const s = manageSearch.toLowerCase();
                    return (u.name || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s);
                  }).map((user) => {
                    const alreadyAssigned = assignedUsers.some((a) => a.id === user.id);
                    return (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded" style={{ border: "1px solid var(--border)" }}>
                        <div>
                          <div className="text-sm font-medium">{user.name || user.email}</div>
                          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</div>
                        </div>
                        <div>
                          {alreadyAssigned ? <span className="text-sm text-slate-500">Assigned</span> : <button className="text-sm text-green-600" onClick={() => handleAddUserToProject(user.id, selectedProjectId)}>Add</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;

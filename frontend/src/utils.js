export const getStoredUserId = () => {
  const stored = localStorage.getItem("userId");
  if (stored && stored !== "undefined" && stored !== "null") {
    return Number(stored);
  }

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const uid = payload.userId || payload.id;
      if (uid) {
        localStorage.setItem("userId", uid);
        return Number(uid);
      }
    } catch (_) {
      // ignore malformed token payloads
    }
  }

  return null;
};

export const getAssignedId = (ticket) => {
  if (!ticket || ticket.assignedTo == null) return null;
  if (typeof ticket.assignedTo === "object") return Number(ticket.assignedTo.id);
  return Number(ticket.assignedTo);
};

export const getColumnForStatus = (status) => {
  if (status === "Approved") return "Approved";
  if (status === "Ready for Approval") return "Ready for Approval";
  if (status === "In Progress") return "In Progress";
  if (status === "Resolved") return "Resolved";
  return "Open";
};

export const getStoredRoleId = () => {
  const stored = localStorage.getItem("roleId");
  if (stored && stored !== "undefined" && stored !== "null") return Number(stored);

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const rid = payload.roleId || payload.role || payload.role_id;
      if (rid) {
        localStorage.setItem("roleId", rid);
        return Number(rid);
      }
    } catch (_) {}
  }

  return null;
};

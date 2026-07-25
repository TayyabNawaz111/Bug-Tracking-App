import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppShell from "../components/AppShell";
import { API_URL } from "../config/config";
import { getAssignedId, getColumnForStatus, getStoredUserId } from "../utils";

const COLUMNS = [
  { id: "Open",               label: "Open",                accent: "#8b95a1", glow: "rgba(139,149,161,0.18)", locked: false },
  { id: "In Progress",        label: "In Progress",         accent: "#e3a24c", glow: "rgba(227,162,76,0.18)",  locked: false },
  { id: "Resolved",           label: "Resolved",            accent: "#4fbdb3", glow: "rgba(79,189,179,0.18)",  locked: false },
  { id: "Ready for Approval", label: "Ready for Approval",  accent: "#9f67fa", glow: "rgba(159,103,250,0.18)", locked: false },
  { id: "Approved",           label: "Done",                accent: "#34d399", glow: "rgba(52,211,153,0.18)",  locked: true  },
];

const SEVERITY = {
  Low:      { color: "#8b95a1", bg: "rgba(139,149,161,0.14)" },
  Medium:   { color: "#e3a24c", bg: "rgba(227,162,76,0.14)"  },
  High:     { color: "#d97a46", bg: "rgba(217,122,70,0.14)"  },
  Critical: { color: "#d96565", bg: "rgba(217,101,101,0.14)" },
};

function TicketCard({ ticket, column, onDragStart, onRequestApproval, isApproving }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY[ticket.severity] || SEVERITY.Low;
  const isResolved = column.id === "Resolved";
  const isLocked = column.locked;

  return (
    <div
      id={`kanban-card-${ticket.id}`}
      draggable={!isLocked}
      onDragStart={isLocked ? undefined : (e) => onDragStart(e, ticket.id, column.id)}
      onDragEnd={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
      style={{
        background: "var(--card-bg)",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        borderTop: `3px solid ${column.accent}`,
        padding: "12px 14px",
        cursor: isLocked ? "default" : "grab",
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        position: "relative",
        opacity: isLocked ? 0.85 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.boxShadow = `0 0 0 1px ${column.accent}55, 0 8px 24px rgba(0,0,0,0.22)`;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Top meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-secondary)",
          opacity: 0.7,
        }}>
          #{ticket.id}
        </span>

        <span style={{
          fontSize: "10px",
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: "99px",
          color: sev.color,
          background: sev.bg,
          marginLeft: "2px",
        }}>
          {ticket.severity || "Low"}
        </span>

        {isLocked && (
          <span style={{
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: "99px",
            color: "#34d399",
            background: "rgba(52,211,153,0.13)",
          }}>
            ✓ Done
          </span>
        )}

        {/* Expand arrow */}
        <button
          id={`kanban-expand-${ticket.id}`}
          onClick={() => setExpanded(v => !v)}
          style={{
            marginLeft: "auto",
            background: expanded ? `${column.accent}22` : "transparent",
            border: "none",
            cursor: "pointer",
            width: "22px",
            height: "22px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: expanded ? column.accent : "var(--text-secondary)",
            fontSize: "13px",
            transition: "background 0.15s, color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${column.accent}22`;
            e.currentTarget.style.color = column.accent;
          }}
          onMouseLeave={(e) => {
            if (!expanded) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }
          }}
        >
          <span style={{
            display: "inline-block",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.22s ease",
            lineHeight: 1,
          }}>▾</span>
        </button>
      </div>

      {/* Title */}
      <p style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "13px",
        lineHeight: "1.45",
        color: "var(--text-primary)",
        marginBottom: "6px",
        wordBreak: "break-word",
      }}>
        {ticket.title}
      </p>

      {/* Description (expandable) */}
      {expanded && (
        <div style={{
          marginBottom: "10px",
          padding: "9px 11px",
          borderRadius: "8px",
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          animation: "expandIn 0.18s ease",
        }}>
          <p style={{
            fontSize: "11.5px",
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {ticket.description || <em style={{ opacity: 0.5 }}>No description</em>}
          </p>
        </div>
      )}

      {/* Project */}
      {ticket.Project?.title && (
        <p style={{
          fontSize: "10.5px",
          color: "var(--text-secondary)",
          opacity: 0.65,
          marginBottom: isResolved ? "10px" : 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          📁 {ticket.Project.title}
        </p>
      )}

      {/* Request Approval — Resolved column only */}
      {isResolved && (
        <button
          id={`kanban-request-approval-${ticket.id}`}
          onClick={() => onRequestApproval(ticket.id)}
          disabled={isApproving}
          style={{
            width: "100%",
            marginTop: "4px",
            padding: "7px 0",
            borderRadius: "8px",
            fontSize: "11.5px",
            fontWeight: 700,
            border: "none",
            cursor: isApproving ? "not-allowed" : "pointer",
            background: isApproving ? "rgba(159,103,250,0.25)" : "linear-gradient(135deg,#7c3aed,#9f67fa)",
            color: "#fff",
            letterSpacing: "0.03em",
            transition: "opacity 0.15s, transform 0.1s",
            opacity: isApproving ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { if (!isApproving) e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {isApproving ? "Requesting…" : "✓ Request Approval"}
        </button>
      )}
    </div>
  );
}

function KanbanColumn({ column, tickets, onDragStart, onDrop, onDragOver, onDragLeave, isDragOver, onRequestApproval, approvingId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "0" }}>
      {/* Column header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 4px 10px 4px",
        borderBottom: `2px solid ${column.accent}`,
        marginBottom: "12px",
      }}>
        <span style={{
          width: "7px", height: "7px",
          borderRadius: "50%",
          background: column.accent,
          boxShadow: `0 0 6px ${column.accent}`,
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "12px",
          color: column.accent,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          flex: 1,
        }}>
          {column.label}
        </span>
        {column.locked && (
          <span style={{ fontSize: "11px", opacity: 0.7, color: column.accent }}>🔒</span>
        )}
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 700,
          color: column.accent,
          background: `${column.accent}1a`,
          borderRadius: "99px",
          padding: "1px 8px",
        }}>
          {tickets.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={column.locked ? undefined : onDragOver}
        onDrop={column.locked ? undefined : onDrop}
        onDragLeave={column.locked ? undefined : onDragLeave}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "9px",
          minHeight: "120px",
          padding: "8px",
          borderRadius: "10px",
          border: isDragOver && !column.locked
            ? `2px dashed ${column.accent}`
            : "2px dashed transparent",
          background: isDragOver && !column.locked
            ? `${column.accent}0d`
            : "transparent",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        {tickets.length === 0 ? (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100px",
          }}>
            <p style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              opacity: 0.4,
              fontStyle: "italic",
              textAlign: "center",
            }}>
              {column.locked ? "No approved tickets" : "Drop here"}
            </p>
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              column={column}
              onDragStart={onDragStart}
              onRequestApproval={onRequestApproval}
              isApproving={approvingId === ticket.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanPage({ setIsSignIn, setRoleId }) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [toast, setToast] = useState(null);
  const dragInfo = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch tickets ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = getStoredUserId();
        const res = await axios.get(`${API_URL}/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mine = (res.data || []).filter(t => getAssignedId(t) === userId);
        const buckets = {};
        COLUMNS.forEach(c => (buckets[c.id] = []));
        mine.forEach(t => {
          const key = getColumnForStatus(t.status || "Open");
          (buckets[key] ?? buckets["Open"]).push(t);
        });
        setTickets(buckets);
      } catch (err) {
        setError("Could not load your tickets.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e, ticketId, fromColumn) => {
    dragInfo.current = { ticketId, fromColumn };
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      const el = document.getElementById(`kanban-card-${ticketId}`);
      if (el) el.style.opacity = "0.35";
    }, 0);
  }, []);

  const handleDragOver = useCallback((e, colId) => {
    if (COLUMNS.find(c => c.id === colId)?.locked) return;
    e.preventDefault();
    setDragOverCol(colId);
  }, []);

  const handleDragLeave = useCallback(() => setDragOverCol(null), []);

  const handleDrop = useCallback(async (e, toColumn) => {
    e.preventDefault();
    setDragOverCol(null);
    const { ticketId, fromColumn } = dragInfo.current || {};
    if (!ticketId || fromColumn === toColumn || toColumn === "Approved") {
      const el = document.getElementById(`kanban-card-${ticketId}`);
      if (el) el.style.opacity = "1";
      return;
    }
    const el = document.getElementById(`kanban-card-${ticketId}`);
    if (el) el.style.opacity = "1";

    // Optimistic move
    setTickets(prev => {
      const from = [...(prev[fromColumn] || [])];
      const to   = [...(prev[toColumn]   || [])];
      const idx  = from.findIndex(t => t.id === ticketId);
      if (idx === -1) return prev;
      const [moved] = from.splice(idx, 1);
      moved.status = toColumn;
      to.push(moved);
      return { ...prev, [fromColumn]: from, [toColumn]: to };
    });

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/tickets/${ticketId}/updateStatus`, { status: toColumn }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(`Moved to "${toColumn}"`);
    } catch {
      showToast("Failed to update — reverting", "error");
      setTickets(prev => {
        const from = [...(prev[fromColumn] || [])];
        const to   = [...(prev[toColumn]   || [])];
        const idx  = to.findIndex(t => t.id === ticketId);
        if (idx === -1) return prev;
        const [moved] = to.splice(idx, 1);
        moved.status = fromColumn;
        from.push(moved);
        return { ...prev, [fromColumn]: from, [toColumn]: to };
      });
    }
    dragInfo.current = null;
  }, []);

  // ── Request Approval ─────────────────────────────────────────────────────────
  const handleRequestApproval = useCallback(async (ticketId) => {
    setApprovingId(ticketId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/tickets/${ticketId}/requestApproval`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`${API_URL}/tickets/${ticketId}/updateStatus`, { status: "Ready for Approval" }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        showToast("Failed to request approval", "error");
        setApprovingId(null);
        return;
      }
    }
    setTickets(prev => {
      const resolved = [...(prev["Resolved"] || [])];
      const waiting  = [...(prev["Ready for Approval"] || [])];
      const idx = resolved.findIndex(t => t.id === ticketId);
      if (idx === -1) return prev;
      const [moved] = resolved.splice(idx, 1);
      moved.status = "Ready for Approval";
      waiting.push(moved);
      return { ...prev, Resolved: resolved, "Ready for Approval": waiting };
    });
    showToast("Approval requested ✓");
    setApprovingId(null);
  }, []);

  const totalTickets = Object.values(tickets).reduce((s, arr) => s + arr.length, 0);

  return (
    <AppShell
      eyebrow="DEVELOPER · KANBAN"
      title="My Kanban Board"
      roleId={2}
      setIsSignIn={setIsSignIn}
      setRoleId={setRoleId}
    >
      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes slideUp   { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes expandIn  { from { opacity:0; max-height:0; } to { opacity:1; max-height:200px; } }
        [draggable="true"]:active { cursor: grabbing !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, padding: "10px 22px", borderRadius: "10px",
          fontSize: "13px", fontWeight: 600,
          background: toast.type === "error" ? "rgba(178,58,58,0.95)" : "rgba(15,107,101,0.95)",
          color: "#fff", boxShadow: "0 6px 28px rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)", whiteSpace: "nowrap",
          animation: "slideUp 0.22s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "24px", flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Per-column badges */}
          {COLUMNS.map(col => (
            <span key={col.id} style={{
              display: "flex", alignItems: "center", gap: "5px",
              fontSize: "12px", fontWeight: 600,
              color: col.accent,
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: col.accent, boxShadow: `0 0 5px ${col.accent}`,
              }} />
              {col.label}
              <span style={{
                background: `${col.accent}1a`,
                borderRadius: "99px", padding: "0 7px",
                fontFamily: "var(--font-mono)", fontSize: "11px",
              }}>
                {(tickets[col.id] || []).length}
              </span>
            </span>
          ))}
          <span style={{
            fontSize: "12px", color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
          }}>
            / {totalTickets} total
          </span>
        </div>

        <button
          onClick={() => navigate("/bugs")}
          style={{
            padding: "7px 16px", borderRadius: "8px",
            fontSize: "12px", fontWeight: 500,
            border: "1px solid var(--border)",
            background: "var(--card-bg)",
            color: "var(--text-secondary)", cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color="var(--accent)"; e.currentTarget.style.borderColor="var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color="var(--text-secondary)"; e.currentTarget.style.borderColor="var(--border)"; }}
        >
          ← Bug List
        </button>
      </div>

      {/* Hint */}
      <p style={{ fontSize: "12px", color: "var(--text-secondary)", opacity: 0.55, marginBottom: "20px" }}>
        Drag cards to change status · Click <strong style={{ color: "var(--text-secondary)" }}>▾</strong> to expand description · <span style={{ color: "#34d399" }}>Done 🔒</span> is read-only
      </p>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "260px" }}>
          <div style={{
            width: "32px", height: "32px",
            border: "3px solid var(--border)", borderTopColor: "var(--accent)",
            borderRadius: "50%", animation: "spin 0.65s linear infinite",
          }} />
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: "center", paddingTop: "60px", color: "var(--severity-critical)", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Board — CSS grid, 5 equal columns, no horizontal scroll */}
      {!loading && !error && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
          alignItems: "start",
          width: "100%",
        }}>
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tickets={tickets[col.id] || []}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              isDragOver={dragOverCol === col.id}
              onRequestApproval={handleRequestApproval}
              approvingId={approvingId}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default KanbanPage;

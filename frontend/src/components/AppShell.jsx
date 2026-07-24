import React from "react";
import { NavLink } from "react-router-dom";
import Logout from "./Logout";

const ADMIN_NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
];

const USER_NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/bugs", label: "Bugs" },
//   { to: "/notifications", label: "Notifications" },
];

function AppShell({ eyebrow, title, roleId, setIsSignIn, setRoleId, children }) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <div style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--card-bg)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <div>
              {eyebrow && (
                <p
                  className="text-[11px] uppercase mb-1"
                  style={{
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.14em",
                    color: "var(--text-secondary)",
                  }}
                >
                  {eyebrow}
                </p>
              )}
              <h1
                className="text-2xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Logout setIsSignIn={setIsSignIn} setRoleId={setRoleId} />
            </div>
          </div>

          {/* Persistent nav so pages are reachable without going back to the dashboard */}
          <nav className="flex gap-6 -mb-px">
            {(roleId === 1 ? ADMIN_NAV_LINKS : USER_NAV_LINKS).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  "text-sm font-medium pb-3 border-b-2 transition-colors"
                }
                style={({ isActive }) => ({
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  borderColor: isActive ? "var(--accent)" : "transparent",
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}

export default AppShell;
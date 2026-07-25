const ROLE_IDS = {
  Admin: 1,
  Developer: 2,
  Tester: 3,
};

const normalizeRole = (role) => {
  if (typeof role === "number") return role;
  if (typeof role === "string") {
    const mapped = ROLE_IDS[role];
    if (mapped) return mapped;
    const parsed = Number(role);
    return Number.isInteger(parsed) ? parsed : null;
  }
  return null;
};

const resolveRoleIds = (roles) => roles.map(normalizeRole).filter((id) => id != null);

const authorizeRole = (...allowedRoles) => {
  const allowedRoleIds = resolveRoleIds(allowedRoles);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (allowedRoleIds.includes(req.user.roleId)) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
};

const authorizeSelfOrRoles = (...allowedRoles) => {
  const allowedRoleIds = resolveRoleIds(allowedRoles);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const targetId =
      req.params?.id || req.body?.id || req.body?.userId || req.params?.userId;

    if (targetId && Number(targetId) === req.user.userId) {
      return next();
    }

    if (allowedRoleIds.includes(req.user.roleId)) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
};

module.exports = {
  authorizeRole,
  authorizeSelfOrRoles,
  ROLE_IDS,
};

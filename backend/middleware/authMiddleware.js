// Simple middleware functions to check login and role.
// We are using express-session here (instead of JWT) because
// sessions are a bit easier to understand when you are just
// starting out with authentication.

// Checks if a user is logged in at all (any role)
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: "Please log in first" });
  }
  next();
}

// Checks if the logged-in user has one of the allowed roles
// Usage: requireRole("admin") or requireRole("farmer", "vet")
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: "Please log in first" });
    }
    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({ success: false, message: "You are not allowed to do this action" });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };

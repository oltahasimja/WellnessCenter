module.exports = function (allowedRoles) {
  return function (req, res, next) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient role' });
    }

    next();
  };
};

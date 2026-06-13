function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (req.userRole !== requiredRole) {
      return res.status(403).json({
        message: `Forbidden: Requires ${requiredRole} role`
      });
    }
    next();
  };
}

module.exports = roleMiddleware;

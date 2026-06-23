function roleMiddleware(...requiredRoles) {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.userRole)) {
      return res.status(403).json({
        message: `Forbidden: Requires ${requiredRoles.join(" or ")} role`
      });
    }
    next();
  };
}

module.exports = roleMiddleware;

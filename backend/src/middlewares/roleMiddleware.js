function roleMiddleware(...requiredRoles) {
  return (req, res, next) => {

    const userRoleLower = String(req.userRole || '').toLowerCase();
    const requiredRolesLower = requiredRoles.map(r => r.toLowerCase());

    if (!requiredRolesLower.includes(userRoleLower)) {

      return res.status(403).json({
        message: `Forbidden: Requires ${requiredRoles.join(" or ")} role`
      });
    }
    next();
  };
}

module.exports = roleMiddleware;

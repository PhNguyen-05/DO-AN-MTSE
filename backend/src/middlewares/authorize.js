const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const userRoleLower = String(req.user.role || '').toLowerCase();
    const allowedRolesLower = allowedRoles.map(r => r.toLowerCase());

    if (!allowedRolesLower.includes(userRoleLower)) {
      return res.status(403).json({ 
        success: false, 
        message: `Bạn không có quyền truy cập. Yêu cầu quyền: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = { authorize };
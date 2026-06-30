const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserSession = require("../models/UserSession");

const getTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  return /^Bearer$/i.test(scheme) ? token : authHeader;
};

const verifyWithKnownSecrets = (token) => {
  const secrets = [
    process.env.ACCESS_TOKEN_SECRET,
    process.env.JWT_SECRET,
    "your_jwt_secret"
  ].filter(Boolean);

  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret);
    } catch {
      // Try the next configured secret.
    }
  }

  return null;
};

// Async middleware - verifies token and loads user
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthorized: access token is required."
    });
  }

  const token = getTokenFromHeader(authHeader);

  try {
    const decoded = token ? verifyWithKnownSecrets(token) : null;

    if (!decoded) {
      return res.status(403).json({
        message: "Forbidden: token is invalid or expired."
      });
    }
    
    // Check if session exists in DB (Single device login & Block account mechanic)
    const sessionExists = await UserSession.findOne({ userId: decoded.id || decoded._id, token });
    if (!sessionExists) {
      return res.status(403).json({
        message: "Phiên đăng nhập đã hết hạn, bị khóa hoặc bạn đã đăng nhập ở thiết bị khác."
      });
    }
    
    // Update last active
    sessionExists.lastActiveAt = new Date();
    await sessionExists.save();

    const user = await User.findById(decoded.id || decoded._id);
    
    if (!user || user.status === 'Bị khóa') {
      return res.status(401).json({ message: "Tài khoản của bạn đã bị khóa hoặc không tồn tại." });
    }

    req.userId = user._id;
    req.userRole = user.role;
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Forbidden: token verification failed."
    });
  }
};

// Sync middleware - now converted to async to check DB
const verifyToken = async (req, res, next) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: access token is required."
    });
  }

  const decodedUser = verifyWithKnownSecrets(token);
  if (!decodedUser) {
    return res.status(403).json({
      message: "Forbidden: token is invalid or expired."
    });
  }
  
  try {
    const sessionExists = await UserSession.findOne({ userId: decodedUser.id || decodedUser._id, token });
    if (!sessionExists) {
      return res.status(403).json({
        message: "Phiên đăng nhập đã hết hạn, bị khóa hoặc bạn đã đăng nhập ở thiết bị khác."
      });
    }
    
    const user = await User.findById(decodedUser.id || decodedUser._id);
    if (!user || user.status === 'Bị khóa') {
      return res.status(401).json({ message: "Tài khoản của bạn đã bị khóa hoặc không tồn tại." });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoleLower = String(req.user?.role || '').toLowerCase();
    const allowedRolesLower = allowedRoles.map(r => r.toLowerCase());

    if (!allowedRolesLower.includes(userRoleLower)) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this resource."
      });
    }
    next();
  };
};

module.exports = { authMiddleware, verifyToken, authorize };

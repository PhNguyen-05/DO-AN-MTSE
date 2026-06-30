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

async function authMiddleware(
  req,
  res,
  next
) {

  const authHeader =
    req.headers["authorization"];

  if (!authHeader) {

    return res.status(401)
      .json({
        message:
          "Unauthorized"
      });
  }

  const token =
    getTokenFromHeader(authHeader);

  try {
    const decoded = token
      ? verifyWithKnownSecrets(token)
      : null;

    if (!decoded) {
      return res.status(403)
        .json({
          message:
            "Forbidden"
        });
    }

    const sessionExists = await UserSession.findOne({
      userId: decoded.id || decoded._id,
      token
    });

    if (!sessionExists) {
      return res.status(403).json({
        message: "Phiên đăng nhập đã hết hạn, bị khóa hoặc bạn đã đăng nhập ở thiết bị khác."
      });
    }

    const user = await User.findById(decoded.id || decoded._id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (user.status === 'Bị khóa') {
      return res.status(401).json({ message: "Tài khoản của bạn đã bị khóa." });
    }

    req.userId = user._id;
    req.userRole = user.role;
    req.user = user;

    next();

  }
  catch {

    return res.status(403)
      .json({
        message:
          "Forbidden"
      });
  }
}

module.exports =
  authMiddleware;

require("dotenv").config();

const jwt =
  require("jsonwebtoken");

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
    authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require("../models/User");
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
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
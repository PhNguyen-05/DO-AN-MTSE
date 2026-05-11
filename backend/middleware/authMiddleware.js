require("dotenv").config();

const jwt =
  require("jsonwebtoken");

function authMiddleware(
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

    const decoded =
      jwt.verify(

        token,

        process.env.JWT_SECRET
      );

    req.userId =
      decoded.id;

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
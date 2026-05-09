const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Forgot Password API is running",
    endpoints: [
      "POST /api/forgot-password",
      "POST /api/verify-otp",
      "POST /api/reset-password"
    ]
  });
});

app.use("/api", forgotPasswordRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

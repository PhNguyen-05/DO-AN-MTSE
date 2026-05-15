const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/forgotpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/api-info", (req, res) => {
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

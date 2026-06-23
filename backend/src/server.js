const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const uploadsDir = path.join(__dirname, "..", "uploads");

const startServer = async () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend Node.js is running on http://localhost:${PORT}`);
  });
};

startServer();

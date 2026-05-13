require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.set('trust proxy', 1); // Enable trust proxy for correct rate‑limit handling

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/api", userRoutes); // For compatibility with TestAPI

app.get("/", (req, res) => {
  res.send("Backend API is running. Use Postman to test /api/profile endpoints.");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
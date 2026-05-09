require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authMiddleware =
  require("./middleware/authMiddleware");

const {
  handleGetProfile,
  handleProfileUpdate
} = require("./controllers/profileController");

app.get(
  "/api/profile",
  authMiddleware,
  handleGetProfile
);

const upload =
  require("./middleware/upload");

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static("uploads")
);

mongoose.connect(
  "mongodb://localhost:27017/toeic"
)
.then(() => {
  console.log("MongoDB Connected");
})
.catch(err => {
  console.log(err);
});

app.put(
  "/api/profile",
  authMiddleware,
  upload.single("avatar"),
  handleProfileUpdate
);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const profileRoutes =
  require("./routes/profileRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(
  "/uploads",
  express.static("uploads")
);

mongoose.connect(
  process.env.MONGO_URI
)
.then(() => {
  console.log("MongoDB connected");
})
.catch((err) => {
  console.log(err);
});

app.use("/api", profileRoutes);

app.listen(
  process.env.PORT,
  () => {
    console.log(
      `Server running on port ${process.env.PORT}`
    );
  }
);
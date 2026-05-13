require("dotenv").config();

const jwt = require("jsonwebtoken");

const token = jwt.sign(
  {
    id: "69ff92bb89497361f49d82eb"
  },
  process.env.JWT_SECRET
);

console.log(token);
require("dotenv").config();

console.log(process.env.MONGO_URI);
console.log(process.env.JWT_SECRET);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

async function seed() {

  try {

    console.log(process.env.JWT_SECRET);

    await mongoose.connect(
      process.env.MONGO_URI
    );

    let user = await User.findOne({
      email: "a@gmail.com"
    });

    if (!user) {

      const hashedPassword =
        await bcrypt.hash("123", 10);

      user = await User.create({

        username: "admin",

        name: "Nguyen Van A",

        email: "a@gmail.com",

        phone: "0123456789",

        avatar: "",

        password: hashedPassword

      });

      console.log("User created");

    } else {

      console.log("User already exists");
    }

    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET
    );

    console.log("\n===== TEST DATA =====");

    console.log("Username: admin");

    console.log("Password: 123");

    console.log("\nJWT TOKEN:");

    console.log(token);

  }
  catch (err) {

    console.log(err);

  }
  finally {

    mongoose.disconnect();

  }
}

seed();
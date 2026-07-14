const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function registerUser(req, res) {
  const { name, mobile, email, password } = req.body;

  try {
    if (!name || !mobile || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      mobile,
      email,
      password: hash,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token);

    res.status(201).json({
      message: "user created successfully",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

async function loginUser(req, res) {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                message: "Mobile and password are required"
            });
        }

        const user = await userModel.findOne({ mobile });

        if (!user) {
            return res.status(401).json({
                message: "Invalid mobile number or password"
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid mobile number or password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET
        );

        res.cookie("token", token);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}



module.exports = {registerUser,loginUser}
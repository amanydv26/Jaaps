const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { user_name, password } = req.body;

    // Check required fields
    if (!user_name || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user by username
    const user = await User.findOne({ user_name });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid username",
      });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, user_name: user.user_name, role: user.role },
      "yourSecretKey",     // keep inside quotes as you prefer
      { expiresIn: "7d" }
    );

    // Success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        user_name: user.user_name,
        role: user.role,
        email: user.email,
        company: user.company,
        country: user.country,
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

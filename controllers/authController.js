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
      "1222",     // 
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

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("full_name email user_name catalogues")
      .populate("catalogues"); // populate catalogue details

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // prepare catalogue data safely
    const catalogues = (user.catalogues || []).map((cat) => ({
      _id: cat._id,
      name: cat.name,
      catalogue_path: cat.catalogue_path,
      photo: cat.photo || "",
      accessedOn: cat.createdAt?.toISOString()?.split("T")[0] || "", // optional
    }));

    res.json({
      user: {
        name: user.full_name,
        email: user.email,
        avatar: "/default-avatar.png",
      },
      catalogues,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


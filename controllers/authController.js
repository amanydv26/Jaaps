const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    console.log("checking user" , user_name  )
    if (!user_name || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ user_name });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid username",
      });
    }

    // 🔒 BLOCK ADMINS FROM USER LOGIN
    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Please login via admin portal",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

   const token = jwt.sign(
  {
    userId: user._id.toString(),
    role: user.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    // ✅ USER TOKEN (separate from admin)
    res.cookie("user_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true, // true in production
      path: "/",   
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        full_name: user.full_name,
        user_name: user.user_name,
        role: user.role,
        email: user.email,
        company: user.company,
        country: user.country,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
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


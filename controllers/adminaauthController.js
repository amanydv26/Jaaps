const User = require('../models/userModel')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  try {
    console.log("✅ adminLogin CONTROLLER HIT");

    const { user_name, password } = req.body;

    console.log(user_name , password)
    if (!user_name || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ user_name });

    console.log("USER FOUND:", user ? true : false);
    console.log("USER ROLE:", user?.role);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("PASSWORD MATCH:", isMatch);

if (!isMatch) {
  return res.status(401).json({ message: "Invalid credentials" });
}

const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "3d" }
);

console.log("JWT GENERATED");

return res.status(200).json({
  success: true,
  token,
});

  } catch (error) {
 
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

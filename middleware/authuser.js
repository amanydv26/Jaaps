const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  console.log("🔐 authUser middleware hit");
  console.log("🍪 cookies received:", req.cookies);

  const token = req.cookies.user_token;
  console.log("🎫 user_token:", token);

  if (!token) {
    console.log("❌ No token found");
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ JWT error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// module.exports = (req, res, next) => {
//   try {
//     const token =
//       req.cookies.user_token ||
//       req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = {
//       id: decoded.id,
//       role: decoded.role,
//     };

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token",
//     });
//   }
// };

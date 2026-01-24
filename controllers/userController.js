const User = require("../models/userModel");
const authUser = require("../middleware/authuser");

exports.getUserDashboard = async (req, res) => {
  try {
    console.log("api hitting");

    const userId = req.params.userId;

    const user = await User.findById(userId)
      .select("full_name email catalogues createdAt")
      .populate({
        path: "catalogues.catalogueId",
        select: "name catalogue_full_path photo",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FIXED EXPIRY LOGIC (CHANGE IS HERE)
    const catalogues = (user.catalogues || [])
      .filter((cat) => {
        if (!cat.allowed || !cat.catalogueId) return false;

        // if no expiry date → always valid
        if (!cat.expiryDate) return true;

        // allow full expiry day (till 11:59 PM)
        const expiry = new Date(cat.expiryDate);
        expiry.setHours(23, 59, 59, 999);

        return expiry >= new Date();
      })
      .map((cat) => ({
        _id: cat.catalogueId._id,
        name: cat.catalogueId.name,
        catalogue_full_path: cat.catalogueId.catalogue_full_path,
        photo: cat.catalogueId.photo || "",
        expiryDate: cat.expiryDate || null,
        accessedOn: cat.accessedOn || null,
      }));

    return res.status(200).json({
      user: {
        name: user.full_name,
        email: user.email,
        avatar: "/default-avatar.png",
        createdAt: user.createdAt,
      },
      catalogues,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.addUserCataloguesFromToken = async (req, res) => {
  try {
    console.log("📦 Body:", req.body);
    console.log("👤 User from token:", req.user);

    const userId = req.user.userId; // ✅ FIXED
    const { enable = [], expiryDate } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!Array.isArray(user.catalogues)) {
      user.catalogues = [];
    }

    console.log("📄 User before update:", user.catalogues);

    enable.forEach((catId) => {
      const existing = user.catalogues.find(
        (c) => c.catalogueId.toString() === catId
      );

      if (existing) {
        existing.allowed = true;
        existing.expiryDate = expiryDate || existing.expiryDate;
      } else {
        user.catalogues.push({
          catalogueId: catId,
          allowed: false,
          expiryDate: expiryDate || null,
        });
      }
    });

    await user.save();

    console.log("✅ User after update:", user.catalogues);

    return res.json({
      success: true,
      message: "Catalogues updated",
    });
  } catch (err) {
    console.error("❌ Catalogue update error:", err);
    return res.status(500).json({ success: false });
  }
};



// exports.addUserCataloguesFromToken = async (req, res) => {
//   try {
//     const userId = req.user.id; // 🔑 FROM TOKEN
//     const { enable = [], expiryDate } = req.body;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     enable.forEach((catId) => {
//       const existing = user.catalogues.find(
//         (c) => c.catalogueId.toString() === catId
//       );

//       if (existing) {
//         existing.allowed = true;
//         existing.expiryDate = expiryDate || existing.expiryDate;
//       } else {
//         user.catalogues.push({
//           catalogueId: catId,
//           allowed: false,
//           expiryDate: expiryDate || null,
//         });
//       }
//     });

//     await user.save();

//     console.log(res)
//     return res.status(200).json({
//       success: true,
//       message: "Catalogues added successfully",
//     });
//   } catch (error) {
//     console.error("Add catalogues error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

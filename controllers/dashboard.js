const User = require("../models/userModel");
const Products = require("../models/productModel");
const Catalogue = require("../models/catelogueModel");

exports.getAdminDashboard = async (req, res) => {
  try {
    // Stats
    const [
      totalUsers,
      totalProducts,
      totalCatalogues,
      newAccessUsers
    ] = await Promise.all([
      User.countDocuments(),
      Products.countDocuments(),
      Catalogue.countDocuments(),
      User.find({ isVerified: false, isActive: true })
        .select("full_name company email country createdAt")
        .sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalCatalogues,
        newAccessRequests: newAccessUsers.length,
      },
      accessRequests: newAccessUsers.map(user => ({
        id: user._id,
        name: user.full_name,
        company: user.company || "—",
        email: user.email,
        country: user.country,
        status: "Pending",
        requestedAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data"
    });
  }
};

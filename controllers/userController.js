const User = require("../models/userModel");

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.params.userId; 
    const user = await User.findById(userId)
      .select("full_name email user_name catalogues")
      .populate("catalogues.catalogueId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // prepare catalogue data safely
    const catalogues = (user.catalogues || []).map((cat) => ({
      _id: cat._id,
      name: cat.name,
      catalogue_path: cat.catalogue_path,
      photo: cat.photo || "",
      accessedOn: cat.createdAt?.toISOString()?.split("T")[0] || "",
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

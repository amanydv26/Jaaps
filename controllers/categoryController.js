const Category = require("../models/categoryModel");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .select("_id name")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

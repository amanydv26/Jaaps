const Catalogue = require('../models/catelogueModel');
const Category = require("../models/categoryModel");
exports.getCatalogues = async (req, res) => {
  try {
    
    const catalogues = await Catalogue.find({}, { name: 1 }).sort({ createdAt: -1 });
    console.log("catalogues fetched successfully");
    res.status(200).json({
      success: true,
      message: "Catalogues fetched successfully",
      data: catalogues
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Failed to fetch catalogues",
      error: error.message
    });
  }
};





exports.uploadCatalogue = async (req, res) => {
  try {
    const { name, category } = req.body;  
    // category = "Engine" (string)

    if (!name || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Name and file are required",
      });
    }

    if (!category || typeof category !== "string") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // 🔍 FIND CATEGORY BY NAME
    const categoryDoc = await Category.findOne({ name: category });

    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: `Category '${category}' not found`,
      });
    }

    // CREATE NEW CATALOGUE
    const newCatalogue = await Catalogue.create({
      name,
      catalogue_path: req.fileUUID,
      catalogue_full_path: req.fileFullPath,
      category: categoryDoc._id, // single category id
    });

    res.status(200).json({
      success: true,
      message: "Catalogue uploaded successfully",
      data: newCatalogue,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error,
    });
  }
};


exports.getGroupedCatalogues = async (req, res) => {
  try {
    // 1. Fetch all categories
    const categories = await Category.find();

    // 2. For each category, fetch its catalogues
    const groupedData = await Promise.all(
      categories.map(async (cat) => {
        const catCatalogues = await Catalogue.find({ category: cat._id })
          .select("_id name catalogue_full_path");

        return {
          _id: cat._id,
          name: cat.name,
          catalogues: catCatalogues
        };
      })
    );

    res.status(200).json({
      success: true,
      data: groupedData,
    });
  } catch (error) {
    console.error("Failed to fetch grouped catalogues:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
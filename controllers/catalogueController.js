const Catalogue = require('../models/catelogueModel');

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
    const { name } = req.body;

    if (!name || !req.file) {
      return res.status(400).json({ success: false, message: "Name and file are required" });
    }

    const newCatalogue = await Catalogue.create({
      name,
      catalogue_path: req.fileUUID,
      catalogue_full_path: req.fileFullPath
    });
    res.status(200).json({
      success: true,
      message: "Catalogue uploaded successfully",
      data: newCatalogue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "File upload failed", error });
  }
};

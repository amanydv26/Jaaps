const Catalogue = require('../models/catelogueModel');
const Category = require("../models/categoryModel");
const cloudinary = require("../config/cloudinary")
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
    console.log("file", req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    const baseName = req.file.originalname
      .replace(/\.pdf$/i, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_"); // sanitize filename

 const uploadResult = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      resource_type: "raw",
      folder: "Catalogue_pdf",
      type: "upload",
      public_id: `${Date.now()}_${baseName}`,
      format: "pdf",
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );

  stream.end(req.file.buffer);
});


    console.log("Upload result:", uploadResult); // ✅ Debug log

    // SAVE TO DB
    const newCatalogue = await Catalogue.create({
      name,
      category: categoryDoc._id,
      catalogue_path: uploadResult.public_id,
      catalogue_full_path: uploadResult.secure_url,
    });

    res.status(200).json({
      success: true,
      message: "Catalogue uploaded successfully",
      data: newCatalogue,
    });

  } catch (error) {
    console.error("Catalogue upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload catalogue",
    });
  }
};

// exports.getGroupedCatalogues = async (req, res) => {
//   try {
//     console.log("hitted api")
//     // 1. Fetch all categories
//     const categories = await Category.find();

//     // 2. For each category, fetch its catalogues
//     const groupedData = await Promise.all(
//       categories.map(async (cat) => {
//         const catCatalogues = await Catalogue.find({ category: cat._id })
//           .select("_id name catalogue_full_path");

//         return {
//           _id: cat._id,
//           name: cat.name,
//           catalogues: catCatalogues
//         };
//       })
//     );

//     res.status(200).json({
//       success: true,
//       data: groupedData,
//     });
//   } catch (error) {
//     console.error("Failed to fetch grouped catalogues:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
exports.getGroupedCatalogues = async (req, res) => {
  try {
    console.log("🔥 getGroupedCatalogues API hit");

    const groupedData = await Category.aggregate([
      {
        $lookup: {
          from: "catalogues",   // ⚠️ MUST match MongoDB collection name
          localField: "_id",
          foreignField: "category",
          as: "catalogues",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          catalogues: {
            _id: 1,
            name: 1,
            catalogue_full_path: 1,
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: groupedData,
    });
  } catch (error) {
    console.error("Failed to fetch grouped catalogues:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getGroupeddashboard = async (req, res) => {
  try {
    console.log(" getGroupedCatalogues API hit");

    const groupedData = await Category.aggregate([
      {
        $lookup: {
          from: "catalogues", // must match MongoDB collection name
          localField: "_id",
          foreignField: "category",
          as: "catalogues",
        },
      },
      {
        $project: {
          _id: 1,
          categoryName: "$name",
          catalogues: {
            $map: {
              input: "$catalogues",
              as: "cat",
              in: {
                _id: "$$cat._id",
                name: {
                  $concat: [
                    "$name",
                    " : ",
                    "$$cat.name",
                  ],
                },
                catalogue_full_path: "$$cat.catalogue_full_path",
              },
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: groupedData,
    });
  } catch (error) {
    console.error("Failed to fetch grouped catalogues:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.deleteCatalogues = async (req, res) => {
  try {
    const { ids } = req.body;

    // ✅ Validate
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one catalogue ID is required",
      });
    }

    // 🔍 Fetch catalogues to clean cloudinary
    const catalogues = await Catalogue.find({
      _id: { $in: ids },
    });

    if (catalogues.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No catalogues found",
      });
    }

    // 🧹 Delete files from Cloudinary
    for (const cat of catalogues) {
      if (cat.catalogue_path) {
        await cloudinary.uploader.destroy(cat.catalogue_path, {
          resource_type: "raw",
        });
      }
    }

    // 🗑 Delete from DB
    await Catalogue.deleteMany({
      _id: { $in: ids },
    });

    return res.status(200).json({
      success: true,
      message: `Deleted ${catalogues.length} catalogue(s) successfully`,
    });
  } catch (error) {
    console.error("Delete catalogues error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete catalogues",
    });
  }
};

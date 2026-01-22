const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const XLSX = require("xlsx");

exports.uploadProduct = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);

    if (!data || !data.jaaps_no || !data.category) {
      return res.status(400).json({
        success: false,
        message: "jaaps_no and category are required",
      });
    }

    const category = await Category.findOne({ name: data.category });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category name. Please create the category first.",
      });
    }

    // normalize to arrays
    const oemNos = Array.isArray(data.oem_no)
      ? data.oem_no
      : data.oem_no
      ? [data.oem_no]
      : [];

    const descriptions = Array.isArray(data.description)
      ? data.description
      : data.description
      ? [data.description]
      : [];

    const vehicles = Array.isArray(data.vehicle)
      ? data.vehicle
      : data.vehicle
      ? [data.vehicle]
      : [];

    let product = await Product.findOne({ jaaps_no: data.jaaps_no });

    if (product) {
      if (oemNos.length) product.oem_no.push(...oemNos);
      if (descriptions.length) product.description.push(...descriptions);
      if (vehicles.length) product.vehicle.push(...vehicles);

      product.category = category._id;

      await product.save();

      return res.status(200).json({
        success: true,
        message: "Product updated with new information",
        data: product,
      });
    }

    const newProduct = new Product({
      jaaps_no: data.jaaps_no,
      oem_no: oemNos,
      description: descriptions,
      vehicle: vehicles,
      category: category._id,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "New product created",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save product",
      error: error.message,
    });
  }
};

// exports.uploadProduct = async (req, res) => {
//   try {
//     const data = req.body;
//     console.log(data);

//     if (!data || !data.jaaps_no || !data.category) {
//       return res.status(400).json({
//         success: false,
//         message: "jaaps_no and category are required",
//       });
//     }

//     // Find category using NAME instead of ID
//     const category = await Category.findOne({ name: data.category });

//     if (!category) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid category name. Please create the category first.",
//       });
//     }

//     // Check if product exists using jaaps_no
//     let product = await Product.findOne({ jaaps_no: data.jaaps_no });

//     if (product) {
//       // Append new values
//       if (data.oem_no) product.oem_no.push(data.oem_no);
//       if (data.description) product.description.push(data.description);
//       if (data.vehicle) product.vehicle.push(data.vehicle);
//       // if (data.group) product.group.push(data.group);

//       // Update category (replace previous)
//       product.category = category._id;

//       await product.save();

//       return res.status(200).json({
//         success: true,
//         message: "Product updated with new information",
//         data: product,
//       });
//     }

//     // Create a new product if jaaps_no does not exist
//     const newProduct = new Product({
//       jaaps_no: data.jaaps_no,
//       oem_no: data.oem_no ? [data.oem_no] : [],
//       description: data.description ? [data.description] : [],
//       vehicle: data.vehicle ? [data.vehicle] : [],
//       // group: data.group ? [data.group] : [],
//       category: category._id, // Store category ID
//     });

//     await newProduct.save();

//     res.status(201).json({
//       success: true,
//       message: "New product created",
//       data: newProduct,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to save product",
//       error: error.message,
//     });
//   }
// };

exports.uploadBulkProducts = async (req, res) => {
  try {
    const categoryName = req.body.category;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    if (!categoryName) {
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });
    }

    let category = await Category.findOne({ name: categoryName });

    if (!category) {
      category = await Category.create({ name: categoryName });
      console.log("New category created:");
      // return res.status(400).json({message:"create category from admin"})
    } else {
      console.log("Existing category found:", category.name);
    }

    // Convert Excel buffer to JSON
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let results = [];
    let errors = [];
    let skipped = [];
    // Loop through each row in Excel
    for (const row of sheetData) {
      const { jaaps_no, oem_no, description, vehicle } = row;

      // If jaaps_no or oem_no is missing → log error & skip row
      if (!jaaps_no || !oem_no) {
        errors.push({ row, error: "jaaps_no missing" });
        console.log(row);
        continue;
      }
      const exists = await Product.findOne({
        jaaps_no: row.jaaps_no,
        oem_no: row.oem_no,
      });

      if (exists) {
        skipped.push(row);
        continue;
      }
      let product = await Product.findOne({ jaaps_no });

      if (product) {
        if (oem_no) product.oem_no.push(oem_no);
        if (description) product.description.push(description);
        if (vehicle) product.vehicle.push(vehicle);
        // if (group) product.group.push(group);

        await product.save();

        results.push({ jaaps_no, status: "updated" });
      } else {
        const newProduct = new Product({
          jaaps_no,
          oem_no: [oem_no],
          description: [description],
          vehicle: [vehicle],

          category: category._id,
        });

        await newProduct.save();

        results.push({ jaaps_no, status: "created" });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk upload completed",
      results,
      errors,
      skipped,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk upload",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { search, page = 1 } = req.query;

    const limit = 50;
    const skip = (page - 1) * limit;

    let query = {};

    // If search is present → apply exact search (NO pagination)
    if (search && search.trim() !== "") {
      query = {
        $or: [
          { jaaps_no: search },
          { oem_no: search }
        ]
      };

      const results = await Product.find(query).populate("category", "name");

      return res.status(200).json({
        success: true,
        message: "Search results",
        count: results.length,
        data: results
      });
    }

    // Otherwise → normal pagination
    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      page: Number(page),
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      count: products.length,
      data: products,
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

exports.markFeatured = async (req, res) => {
  try {
    const { jaaps_no } = req.body;

    if (!jaaps_no) {
      return res.status(400).json({
        success: false,
        message: "jaaps_no is required"
      });
    }

    // Find product first
    const product = await Product.findOne({ jaaps_no });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Toggle value
    const newStatus = !product.isFeatured;

    // Update the product
    const updatedProduct = await Product.findOneAndUpdate(
      { jaaps_no },
      { isFeatured: newStatus },
      { new: true }
    ).populate("category","name");

    console.log(`${jaaps_no} isFeatured changed to: ${newStatus}`);

    res.status(200).json({
      success: true,
      message: `Product isFeatured updated to ${newStatus}`,
      data: updatedProduct
    });

  } catch (error) {
    console.error("Error updating featured:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update featured status",
      error: error.message
    });
  }
};


exports.getFeaturedProducts = async (req, res) => {
  try {
    // read limit from query, default = 10
    const limit = parseInt(req.query.limit, 10) || 10;

    const featuredProducts = await Product.find({ isFeatured: true })
      .populate("category", "name")
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      count: featuredProducts.length,
      data: featuredProducts,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
    });
  }
};



// -----------------------------
// BULK DELETE PRODUCTS
// -----------------------------
exports.bulkDeleteProducts = async (req, res) => {
  
  console.log("DELETE HITTED");
  try {
    const { ids } = req.body;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs are required for deletion",
      });
    }

    // Delete products
    const result = await Product.deleteMany({
      _id: { $in: ids },
    });

    return res.status(200).json({
      success: true,
      message: "Products deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
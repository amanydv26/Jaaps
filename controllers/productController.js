const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const XLSX = require("xlsx");
exports.uploadProduct = async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.jaaps_no || !data.category) {
      return res.status(400).json({
        success: false,
        message: "jaaps_no and category are required"
      });
    }

    // Validate category
    const category = await Category.findById(data.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    // Check if product exists using jaaps_no
    let product = await Product.findOne({ jaaps_no: data.jaaps_no });

    if (product) {
      // Append new values
      if (data.oem_no) product.oem_no.push(data.oem_no);
      if (data.description) product.description.push(data.description);
      if (data.vehicle) product.vehicle.push(data.vehicle);
      if (data.group) product.group.push(data.group);

      // Update category (replace previous)
      product.category = data.category;

      await product.save();

      return res.status(200).json({
        success: true,
        message: "Product updated with new information",
        data: product
      });
    }

    // Create a new product if jaaps_no does not exist
    const newProduct = new Product({
      jaaps_no: data.jaaps_no,
      oem_no: data.oem_no ? [data.oem_no] : [],
      description: data.description ? [data.description] : [],
      vehicle: data.vehicle ? [data.vehicle] : [],
      group: data.group ? [data.group] : [],
      category: data.category   // Store category ID
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "New product created",
      data: newProduct
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save product",
      error: error.message
    });
  }
};



exports.uploadBulkProducts = async (req, res) => {
  try {

    const categoryName = req.body.category;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file"
      });
    }
    
    if (!categoryName) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }



    
   
    let category = await Category.findOne({ name: categoryName });

    
    if (!category) {
      // category = await Category.create({ name: categoryName });
      console.log("New category created:");
      return res.status(400).json({message:"create category from admin"})
    } else {
      console.log("Existing category found:", category.name);
    }
    

    // Convert Excel buffer to JSON
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let results = [];
    let errors = [];
    let skipped =[];

    // Loop through each row in Excel
    for (const row of sheetData) {
      const {
        jaaps_no,
        oem_no,
        description,
        vehicle,
        group
      } = row;

      // If jaaps_no is missing → log error & skip row
      if (!jaaps_no) {
        errors.push({ row, error: "jaaps_no missing" });
        console.log(row);
        continue;
      }
       const exists = await Product.findOne({
        jaaps_no: row.jaaps_no,
        oem_no: row.oem_no
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
        if (group) product.group.push(group);

        await product.save();

        results.push({ jaaps_no, status: "updated" });
      } else {
        const newProduct = new Product({
          jaaps_no,
          oem_no: [oem_no],
          description: [description],
          vehicle: [vehicle],
          group: [group],
          category: category._id
        });

        await newProduct.save();

        results.push({ jaaps_no, status: "created" });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk upload completed",
      results,errors,skipped
    });

  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk upload",
      error: error.message
    });
  }
};




exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()

    res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      data: products
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
};

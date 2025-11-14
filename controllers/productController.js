const Product = require('../models/productModel');
const XLSX = require("xlsx");
exports.uploadProduct = async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.JAAPS_NO) {
      return res.status(400).json({
        success: false,
        message: "JAAPS_NO is required"
      });
    }

    // Check if product exists using JAAPS_NO
    let product = await Product.findOne({ JAAPS_NO: data.JAAPS_NO });

    if (product) {
      // Always append the values
      if (data.OEM_NO) product.OEM_NO.push(data.OEM_NO);
      if (data.description) product.description.push(data.description);
      if (data.vehicle) product.vehicle.push(data.vehicle);
      if (data.group) product.group.push(data.group);

      await product.save();

      return res.status(200).json({
        success: true,
        message: "New information added to existing product",
        data: product
      });
    }

    // Create a new product if JAAPS_NO does not exist
    const newProduct = new Product({
      JAAPS_NO: data.JAAPS_NO,
      OEM_NO: [data.OEM_NO],
      description: [data.description],
      vehicle: [data.vehicle],
      group: [data.group]
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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file"
      });
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
        JAAPS_NO,
        OEM_NO,
        description,
        vehicle,
        group
      } = row;

      // If JAAPS_NO is missing → log error & skip row
      if (!JAAPS_NO) {
        errors.push({ row, error: "JAAPS_NO missing" });
        console.log(row);
        continue;
      }
       const exists = await Product.findOne({
        JAAPS_NO: row.JAAPS_NO,
        OEM_NO: row.OEM_NO
      });

      if (exists) {
        skipped.push(row);
        continue;
      }
      let product = await Product.findOne({ JAAPS_NO });

      if (product) {
        if (OEM_NO) product.OEM_NO.push(OEM_NO);
        if (description) product.description.push(description);
        if (vehicle) product.vehicle.push(vehicle);
        if (group) product.group.push(group);

        await product.save();

        results.push({ JAAPS_NO, status: "updated" });
      } else {
        const newProduct = new Product({
          JAAPS_NO,
          OEM_NO: [OEM_NO],
          description: [description],
          vehicle: [vehicle],
          group: [group]
        });

        await newProduct.save();

        results.push({ JAAPS_NO, status: "created" });
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

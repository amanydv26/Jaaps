const cloudinary = require("../config/cloudinary");
const Image = require("../models/imageModel");
const Product = require("../models/productModel");
const streamifier = require("streamifier");

exports.uploadImagesFromFolder = async (req, res) => {
  try {
    const files = req.files;
    const {category} = req.body;  
   console.log(`${category} images are uploading`);
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded"
      });
    }

    let uploaded = [];
    let skipped = [];
    let notFound = [];

    for (const file of files) {
      const filename = file.originalname;

      let jaaps_no = filename.substring(0, filename.lastIndexOf("."));
      jaaps_no = jaaps_no.replace(/\s+/g, "/");

      // Check if product exists
      const product = await Product.findOne({ jaaps_no });

      if (!product) {
        notFound.push({
          jaaps_no,
          reason: "JAAPS number not found in database",
        });
        continue;
      }

      // Extract category from product
    //  const category = product.category ? product.category.toLowerCase() : "uncategorized";

      // Check if image already exists
      const existingImage = await Image.findOne({ jaaps_no });

      if (existingImage) {
        skipped.push({
          jaaps_no,
          reason: "Image already exists",
        });
        continue;
      }
        
      // Upload to Cloudinary with category folder + original filename
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `jaaps_products/${category}`,  
            public_id:  jaaps_no, 
            use_filename: true,
            unique_filename: false,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      const imageURL = uploadResult.secure_url;

      // Save in Image model
      await Image.findOneAndUpdate(
        { jaaps_no },
        { image_url: imageURL },
        { upsert: true }
      );

      // Save in Product model
      await Product.findOneAndUpdate(
        { jaaps_no },
        { image_url: imageURL }
      );

      uploaded.push({
        jaaps_no,
        category,
        image_url: imageURL,
      });
    }

    res.status(200).json({
      success: true,
      message: "Image upload process completed",
      totalFilesReceived: files.length,
      totalUploaded: uploaded.length,
      totalSkipped: skipped.length,
      totalNotFound: notFound.length,
      uploaded,
      skipped,
      notFound,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

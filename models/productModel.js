const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    jaaps_no: { type: String },
    oem_no: [{ type: String }],
    description: [{ type: String }],
    vehicle: [{ type: String }],
    // group: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    image_url: { type: String },
    isFeatured:{type:Boolean , default:false}
  },
  { strict: "throw" }
);


 productSchema.index({ jaaps_no: 1, oem_no: 1 }, { unique: true }); 

module.exports =
  mongoose.model.Products || new mongoose.model("Products", productSchema);

const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  jaaps_no: { type: String, required: true, unique: true },
  image_url: { type: String, required: true }
});

module.exports =
  mongoose.models.Images || mongoose.model("Images", imageSchema);

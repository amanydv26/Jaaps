const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    JAAPS_NO: { type: String },
    OEM_NO: [{ type: String}],
    description: [{ type: String }],
    vehicle: [{ type: String }],
    group: [{ type: String }]
}, { strict: "throw" });

productSchema.index({ JAAPS_NO: 1, OEM_NO: 1 }, { unique: true }); //combination of uniqueness

module.exports = mongoose.model('Products', productSchema);

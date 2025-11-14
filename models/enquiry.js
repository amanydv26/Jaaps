const mongoose = require('mongoose')

const enquirySchema = new mongoose.Schema({
    full_Name:{type:String},
    email:{type:String},
    phone:{type:String},
    subject:{type:String},
    message:{type:String}
},{timestamps:true});

module.exports = mongoose.model('enquiry' , enquirySchema);
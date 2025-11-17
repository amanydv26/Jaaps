const mongoose = require('mongoose')

const catalogueSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    catalogue_path:{
        type:String,
        require:true
    },
    catalogue_full_path:{
        type:String,
        require:true
    },
    photo:{
        type:String
    }
},{timestamps:true});

module.exports = mongoose.model('Catalogue' ,catalogueSchema );

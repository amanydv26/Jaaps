const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    full_name:{
        type:String,
    },
    company:{ type:String},
    email:{ type:String},
    country:{ type:String},
    catalogues: [{type : mongoose.Schema.Types.ObjectId , ref: 'Catalogue'}],
    isVerified : { type:Boolean , default:false},
    user_name:{ type:String , default: null},
    password : {type:String , default : null},
    role : {type:String , enum:["admin" , "user"] , default: "user"}
})

module.exports = mongoose.model('User' ,userSchema );


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});


module.exports = mongoose.model('User' ,userSchema );


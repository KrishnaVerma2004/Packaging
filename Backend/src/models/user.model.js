const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"]
    },
    mobile:{
        type:Number,
        required:[true,"mobile number is required"],
        unique:[true,"mobile number must be unique"]
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:[true,"email must be unique"]
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
})

const userModel = mongoose.model("user",userSchema)

module.exports = userModel
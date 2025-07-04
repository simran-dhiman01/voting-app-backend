const mongoose = require('mongoose')

const userSchemea = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:['voter','admin'],
        default:'voter'
    },
    mobile:{
        type:String,
    },
    address:{
        type:String,
        required:true
    },
    adharNumber:{
        type:Number,
        required:true,
        unique:true
    },
    isVoted:{
        type:Boolean,
        default:false
    }

})
const User = mongoose.model('User',userSchemea)
module.exports =User;
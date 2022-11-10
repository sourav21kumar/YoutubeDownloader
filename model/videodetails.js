const mongoose = require('mongoose')

const downloadSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    quality:{
        type: String,
        required:true
    },
    embedURL:{
        type: String,
        required: true
    }
})
const videoSchema = new mongoose.Schema({
    userID:{
       type: String,
       required: true
    },
    email:{
        type: String,
        required:[true,"Email is required"]
    },
    downloads:[downloadSchema],
    
},
{
    timestamps:true
})

// const videoSchema = new mongoose.Schema({
//     embedURL: {
//         type: String,
//         required:true
//     },
//     title:{
//         type:String,
//         required:true
//     },
//     resolution:{
//         type:String,
//         required:true
//     },
//     // userID:{
//     //     type:String,
//     //     required:true
//     // }
// },
// {timestamps:true})

module.exports = mongoose.model('vidschema',videoSchema);

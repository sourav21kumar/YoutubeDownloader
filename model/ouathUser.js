const mongoose = require('mongoose')
const OAUTHUserSchema = new mongoose.Schema({
    oauthProvider:{
        type:String,
        required:true
    },
    oauthID:{
        type:String,
        required:true
    },
    username:{
        type: String
    },
    email:{
        type: String
    },
    picture:{
        type:String
    }
})

module.exports = mongoose.model('oauthuserschema', OAUTHUserSchema) 
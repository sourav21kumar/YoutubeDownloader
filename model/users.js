const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true,'Enter a Valid Username']
    },
    email: {
        type: String,
        required: [true,'email is required'],
        unique: true,
        lowerCase:true,
        validate: [isEmail, 'Please Enter a Valid email_id']
       
    },
    password: {
        type: String,
        required: [true,'Please Enter a Password'],
        minLength: [6,'Minimum Password Length is 6 Characters']
    }

})

// Hasing The Password Before Storing It To The Database
userSchema.pre('save',async function (next){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})


// Creating Static Method
userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email:email})
    if(user){
        const authenticated = await bcrypt.compare(password,user.password)
        if(authenticated){
            // console.log(user)
            return user
        }
        throw Error('Incorrect Password')
    }
    throw Error('Incorrect Email')


}
module.exports = mongoose.model('userschema',userSchema);
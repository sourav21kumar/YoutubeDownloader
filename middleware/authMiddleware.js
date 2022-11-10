const jwt = require('jsonwebtoken')
const userschema = require('../model/users') // Importing the userschema 
const authenticationChecker = (req,res,next)=>{
    // Accesing the JWT token from the Cookies
    const jwtToken = req.cookies.UserAuthentication  

    if(req.user) // This will be true if the user is trying to login through oauth 
    {
        console.log(req.user)
        res.locals.user_email = req.user
        next()
    }
    else if(jwtToken)
    {
        
        jwt.verify(jwtToken,'cRvusnU8BJ4aFe7yAAAD',(err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.redirect('/auth/signup')
            }
            else{
                // console.log(decodedToken)
                next()
            }
        })
    }
    else
    {
        res.redirect('/auth/signup')  // Redirecting the user to the signup Page
    }
}   

// Check Current User
const checkUser = (req,res,next)=>{
    const jwtToken = req.cookies.UserAuthentication
    if(req.user)
    {
        console.log(req.user)
        res.locals.user_email = req.user
        next()
    }
    else if(jwtToken)
    {
        jwt.verify(jwtToken,'cRvusnU8BJ4aFe7yAAAD', async(err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user_email = null
                next();
            }
            else{
                // console.log(decodedToken)
                let user = await userschema.findById(decodedToken.id)
                res.locals.user_email = user
                next()
            }
        })
    }
    else
    {
      res.locals.user_email = null
      next()
    }
}
module.exports = { authenticationChecker, checkUser }
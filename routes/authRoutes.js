const express = require('express')
const router = express.Router()
const authController = require('../controller/authController')
const passport = require('passport')
// Signup
router.get('/signup',authController.signup_get)
router.post('/signup',authController.signup_post)

// Login
router.get('/login',authController.login_get)
router.post('/login',authController.login_post)

// Logout
router.get('/logout', authController.logout)

// OAUTH authenticaton routes
router.get('/google/oauth', passport.authenticate('google',{
    scope:['profile','email']
}))

router.get('/oauth2/redirect/google', passport.authenticate('google') ,(req,res)=>{
    // res.status(201).send({Message:'Successfully redirected to the redirect URL...'})
    // res.status(201).send(req.user)
    res.redirect('/') // Redirect to the index page
})
module.exports = router;


const passport = require("passport");
const googleStrategy = require("passport-google-oauth20");
const oauthuserschema = require("../model/ouathUser");
require("dotenv").config();

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done)=>{
    oauthuserschema.findById(id).then((user)=>{
        done(null, user)
    })
})
passport.use(
    new googleStrategy(
        {
            callbackURL: "/auth/oauth2/redirect/google",
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
        (accessToken, refreshToken, profile, done) => {

            if ((profile.provider = "google")) {
                // For google+ oauth provider
                try {
                    oauthuserschema.findOne({ oauthID: profile.id }).then((user) => {
                        if (user) {
                          
                            done(null, user)
                        } else {
                            oauthuserschema.create({
                                oauthProvider: profile.provider,
                                oauthID: profile.id,
                                username:profile.displayName,
                                email:profile._json.email,
                                picture:profile._json.picture
                            }).then(user => {
                        
                                done(null, user)
                            });

                            
                        }
                    });
                } catch (error) {
                    console.log(error)
                }
            } // This will be for facebook oauth provider
            else {
                try {
                    oauthuserschema.findOne({ oauthID: profile.id }).then((user) => {
                        if (user) {
                            console.log(user)
                            done(null, user)
                        } else {
                            oauthuserschema.create({
                                oauthProvider: profile.provider,
                                oauthID: profile.id,
                            }).then(user => {
                                console.log(user)
                                done(null, user)
                            });
                        }
                    });
                } catch (error) {
                    console.log(error)
                }
            }


        }
    )
);

// Updates to be done of V 1.0.0
// Rolling out the first version. -------- very very soon


// DASHBOARD UPDATE
//  Adding utility buttons
//          ---- For re-downloading the video
//          ---- For deleting the video details



//  ------DONE--------
// error in cookie-session should shift to express-session
// Favicon is added
// Google+ and Facebook OAUTH authentication to be integrated
// Fix the login page
// Alert when a video is downloaded 
// After downloading a video setting the downloader for another video
// Sorting of video details feature to be implemented

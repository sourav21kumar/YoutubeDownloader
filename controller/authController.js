const userschema = require('../model/users') // Importing the userschema 
const vidschema = require('../model/videodetails')  // Imported the Database Schema for the Video-details
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

//import the aws-sdk to interact with the aws S3
const AWS = require('aws-sdk')

// Configuring the aws sdk
AWS.config.update(
    aws_access_key_id = process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY,
    region_name = process.env.AWS_REGION
)

// Creating a s3 instance
const s3 = new AWS.S3()

const handleErrors = (err) => {
    console.log(err)
    // console.log(err.message)
    // console.log(err.errors) 

    let customErrors = { username: '', email: '', password: '' }

    // Incorrect Email
    if (err.message === 'Incorrect Email') {
        customErrors.email = 'Email Id not Registered..Try Again!'
    }

    // Incorrect Password
    if (err.message === 'Incorrect Password') {
        customErrors.password = 'Invalid Password..Try Again!'
    }
    // Validation Errors
    if (err.message.includes("userschema validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            customErrors[properties.path] = properties.message;
        });
    }
    // console.log(customErrors)
    return customErrors
}

// id is the default id created by the database
// cRvusnU8BJ4aFe7yAAAD    ---- Secret Token
const maxAge = 3 * 24 * 60 * 60
const createToken = (_id, _email_id) => {
    payload = {
        id: _id,
        email_id: _email_id
    }
    return jwt.sign(payload, 'cRvusnU8BJ4aFe7yAAAD', { expiresIn: maxAge })
}

module.exports.signup_get = (req, res) => {
    res.render('signuppage')
}

module.exports.signup_post = async (req, res) => {

    const { username, email, password } = req.body
    console.log(username)
    console.log(email)
    console.log(password)

    // Using the dynamic import for generating the userID
    // const {nanoid} = await import('nanoid')
    // let userID = await nanoid()

    try {
        await userschema.create({ username, email, password }).then(result => {
            // console.log(result)

            const token = createToken(result._id, result.email)
            res.cookie('UserAuthentication', token, { httpOnly: true, maxAge: maxAge * 1000 })
            res.status(201).json({ UserID: result._id })
        })//.catch(err=>{console.log(err)})

    } catch (error) {
        // console.log(error)
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    }


}

module.exports.login_get = (req, res) => {
    res.render('loginpage')
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body
    // console.log(email)
    // console.log(password) 

    try {

        const user = await userschema.login(email, password)
        const token = createToken(user._id, user.email)
        res.cookie('UserAuthentication', token, { httpOnly: true, maxAge: maxAge * 1000 })
        // console.log(user._id)
        res.status(200).json({ UserID: user._id })
    } catch (error) {
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    }
}

module.exports.logout = function (req, res, next) {

    if (req.user) {
        req.logout(function (err) {
            if (err) {
                return next(err)
            }
            res.redirect('/auth/login')
        })
    }
    else {
        res.cookie('UserAuthentication', '', { maxAge: 1 })
        res.redirect('/auth/login')
    }

}

module.exports.downloads = async (req, res) => {

    const { embedURL, title, resolution, filePath, id } = req.body
    let extension = '' //  default extension
    if (resolution == 'audio-Only') {
        extension = '.mp3' // that means resolution = 'audio-only is selected
    }
    else {
        extension = '.mp4'
    }
    let filename = `${id}` + `${extension}`
    // const data = req.body
    // console.log(data)
    // console.log(embedURL)
    // console.log(title)
    // console.log(resolution)
    const jwtToken = req.cookies.UserAuthentication
    // For oauth user
    if (req.user) {
        try {
            vidschema.findOne({ email: req.user.email }).then((user => {
                if (user) {
                    console.log(user)
                    let videoList = user.downloads
                    // If exist then update the downloads field
                    videoList.push({ title: title, quality: resolution, embedURL: embedURL })
                    try {
                        vidschema.updateOne({
                            userID: user.userID
                        }, {
                            $set: {
                                downloads: videoList
                            }
                        }).then((result) => {
                            console.log(result)
                            res.status(201).json({ message: 'Modified Successfully...' })
                        })
                        // res.status(500).json({ message: 'Internal Server Error' })
                    } catch (error) {
                        console.log(error)
                        res.status(500).json({ message: 'Internal Server Error' })
                    }
                } else {
                    console.log('User Not Found... So creating a new one...')
                    try {
                        vidschema.create({
                            userID: req.user.oauthID,
                            email: req.user.email,
                            downloads: [{ title: title, quality: resolution, embedURL: embedURL }]
                        }).then((user) => {
                            console.log(user)
                            res.status(201).json({ message: 'New User video details created...' })
                        })
                        // res.status(500).json({ message: 'Internal Server Error' })
                        // console.log(newuserdata)
                    } catch (error) {
                        console.log(error)
                        res.status(500).json({ message: 'Internal Server Error...' })
                    }
                }
            }))
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Internal Server Error..." })
        }
    }
    else if (jwtToken) {

        jwt.verify(jwtToken, 'cRvusnU8BJ4aFe7yAAAD', async (err, decodedToken) => {
            if (err) {
                console.log(err.message)
                res.redirect('/auth/signup')
            }
            else {
                // console.log(decodedToken)
                try {

                    var uploadParams = { Bucket: process.env.BUCKET_NAME, Body: '', Key: `${filename}` }
                    var fileStream = fs.createReadStream(filePath)
                    // console.log(fileStream)
                    uploadParams.Body = fileStream;
                    fileStream.on('error', function (err) {
                        console.log('File Error', err)
                    })
                    s3.upload(uploadParams, async(err, data)=>{
                        if (err) {
                            console.log("Error", err);
                        } if (data) {
                            console.log("Upload Success", data);
                            const user = await vidschema.findOne({ email: decodedToken.email_id })
                            if (user) {
                                // console.log(user)

                                let videoList = user.downloads
                                // If exist then update the downloads field
                                videoList.push({ title: title, quality: resolution, embedURL: embedURL })
                                try {
                                    await vidschema.updateOne({ userID: decodedToken.id }, {
                                        $set: {
                                            downloads: videoList
                                        }
                                    })
                                    // res.status(201).json({ message: 'Modified Successfully...' })
                                    try {
                                        res.status(201).json({ filename: filename })
                                    } catch (error) {
                                        console.log((error))
                                        res.status(500).json({ message: 'Internal Server Error' })
                                    }
                                } catch (error) {
                                    console.log(error)
                                    res.status(500).json({ message: 'Internal Server Error' })
                                }

                            }
                            else {
                                console.log('User Not Found... So creating a new one...')
                                try {
                                    const newuserdata = await vidschema.create({
                                        userID: decodedToken.id,
                                        email: decodedToken.email_id,
                                        downloads: [{ title: title, quality: resolution, embedURL: embedURL }]
                                    })
                                    // console.log(newuserdata)
                                    res.status(201).json({ filename: filename })


                                } catch (error) {
                                    console.log(error)
                                    res.status(500).json({ message: 'Internal Server Error...' })
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.log(error)
                    res.status(500).json({ message: "Internal Server Error..." })
                }

            }
        })
    }
}


module.exports.dashboard = (req, res) => {
    res.render('dashboard')
}


module.exports.dashboardVideoList = async (req, res) => {
    const jwtToken = req.cookies.UserAuthentication
    // console.log(jwtToken)
    if (req.user) {
        console.log(req.user)
        try {
            vidschema.findOne({ email: req.user.email }).then((userDownloadList) => {
                if (userDownloadList) {
                    // console.log(userDownloadList)
                    res.status(201).json({ downloadList: userDownloadList.downloads })
                }
                else {
                    res.status(201).json({ message: 'Empty List...' })
                }
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Internal Server Error' })
        }
    }
    else if (jwtToken) {
        jwt.verify(jwtToken, 'cRvusnU8BJ4aFe7yAAAD', async (err, decodedToken) => {
            if (err) {
                console.log(err)
                res.redirect('/auth/signup')
            }
            else {
                // console.log(decodedToken)
                try {
                    const userDownloadList = await vidschema.findOne({ email: decodedToken.email_id })
                    // console.log(userDownloadList.downloads)
                    if (userDownloadList) {
                        res.status(201).json({ downloadList: userDownloadList.downloads })
                    }
                    else {
                        res.status(201).json({ message: 'Empty List...' })
                    }
                } catch (error) {
                    console.log(error)
                    res.status(500).json({ message: 'Internel Server Error...' })
                }
            }
        })
    }
}

//  User Credentials
module.exports.getID = async (req, res) => {
    try {
        const jwtToken = req.cookies.UserAuthentication
        if (req.user) {
            res.status(201).json({ id: req.user.oauthID })
        }
        else {
            jwt.verify(jwtToken, 'cRvusnU8BJ4aFe7yAAAD', (err, decodedToken) => {
                if (err) {
                    res.status(501).json({ message: 'Internal Server Error...' })
                }
                else {
                    res.status(201).json({ id: decodedToken.id })
                }
            })
        }
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error...' })
    }
}

module.exports.downloadAWS = (req, res) => {
    const filename = req.params.filename
    console.log(filename)
    // const filename = `https://ytdownloadervideodetails.s3.ap-northeast-1.amazonaws.com/6368a48bf22a17e71612ee4e`

    s3.getObject({ Bucket: process.env.BUCKET_NAME, Key: filename }, function (err, data) {
        if (err) {
            console.log("Error", err)
        } if (data) {
            console.log("Download Success", data)
            res.attachment(filename)
            res.send(data.Body)
            // res.download(file.Body)
        }
    })
}
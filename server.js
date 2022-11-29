const express = require('express')
const socket = require('socket.io')
const ejs = require('ejs')
const passportSetup = require('./config/passportSetup')
const cors = require('cors')
// const cookieSession = require('cookie-session')
var session = require('express-session')
const passport = require('passport')
require("dotenv").config()
const app = express()
const SocketService = require('./socketService')
const server = require('http').Server(app)
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')  // Importing the authRoutes file
const appRoutes = require('./routes/appRoutes')    // Importing the appRoutes file
const { authenticationChecker, checkUser } = require('./middleware/authMiddleware')
// const {spawn} = require('child_process')
app.use(cors())
app.set('view engine','ejs')   // set ejs as template rendering engine 
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

var http = require('http');
const { response } = require('express')

// app.use(cookieSession({
//     maxAge:3 * 24 * 60 * 60,
//     keys:['cRvusnU8BJ4aFe7yAAAD']
// }))

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

const port = process.env.PORT || 3000
// const child = spawn('python',['text.py','https://www.youtube.com/watch?v=5mATk1O45LI']) 
// // const child = spawn('ls')
// child.stdout.on('data',(data)=>{
//     console.log(data.toString())
// })
// child.stderr.on('data',(data)=>{
//     console.log(`Error message ${data}`)
// })
// child.on('error',(err)=>{
//     console.log(`error ${err}`)
// })
// const DBURI = 'mongodb+srv://sourav21kumar:9937382009@cluster0.aqbyc0s.mongodb.net/videodetails'
try {
     mongoose.connect(process.env.DBURI,{useNewUrlParser:true,useUnifiedTopology:true})
} catch (error) {
    console.log(error) // logging the error
}

app.get('*', checkUser)
app.get('/',authenticationChecker,(req,res)=>{
    res.render('index')
})

// app.get('/signup',(req,res)=>{
//     res.render('signuppage')
// })
server.listen(port,()=>{
    console.log(`Server Listening at Port ${port}...`)
    socketService = new SocketService()
    socketService.attachServer(server)
})

app.use('/auth',authRoutes)
app.use('/application',appRoutes)

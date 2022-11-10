const express = require('express')
const router = express.Router()
const authController = require('../controller/authController')


// Store downloaded videodetails for a user
router.post('/download', authController.downloads)

// Dashboard
router.get('/Dashboard',authController.dashboard)
router.post('/Dashboard/videodetails',authController.dashboardVideoList)

// User credentials
router.get('/id',authController.getID)
module.exports = router;

router.get('/download/:filename', authController.downloadAWS)
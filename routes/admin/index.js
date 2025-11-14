const express = require('express');
const router = express.Router();
const userManagement = require('./usermanagement')
// Import admin controller


// Base admin routes
router.use('/um',userManagement);


// User management child folder
//router.use('/user-management', );

module.exports = router;

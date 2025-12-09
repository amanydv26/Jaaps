const express = require('express');
const { getUserDashboard } = require('../controllers/userController');
const router = express.Router();

router.get("/dashboard/:userId", getUserDashboard);

module.exports = router;

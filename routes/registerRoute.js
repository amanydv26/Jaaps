const express = require('express');
const { registerUser } = require('../controllers/sendmail');
const router = express.Router();

router.post('/', registerUser);

module.exports = router;

const express = require("express");
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const { login  } = require("../controllers/authController");
const {adminLogin } = require("../controllers/adminaauthController")
router.post("/login", login);
router.post("/admin/login", adminLogin);
module.exports = router;

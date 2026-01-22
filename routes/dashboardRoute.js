const express = require("express");
const router = express.Router();



const {
  getAdminDashboard
} = require("../controllers/dashboard");

/**
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
router.get("/", getAdminDashboard);

module.exports = router;

const express = require('express');
const { getUserDashboard , addUserCataloguesFromToken} = require('../controllers/userController');
const router = express.Router();
const authUser = require("../middleware/authuser");



router.get("/me", authUser, (req, res) => {
    console.log("verified");
  res.json({ success: true });
});
router.put("/catalogues", authUser, addUserCataloguesFromToken);

router.get("/dashboard/:userId", getUserDashboard);



module.exports = router;

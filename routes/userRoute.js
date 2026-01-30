const express = require('express');
const { getUserDashboard , addUserCataloguesFromToken,activateUser,getAllowedCatalogues} = require('../controllers/userController');
const router = express.Router();
const authUser = require("../middleware/authuser");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/me", authUser, (req, res) => {
    console.log("verified");
  res.json({ success: true });
});
router.get(
  "/allowed-catalogues",
  authMiddleware,
  getAllowedCatalogues
);

router.put("/catalogues", authUser, addUserCataloguesFromToken);

router.get("/dashboard/:userId", getUserDashboard);

router.patch("/activate/:id", activateUser);

module.exports = router;

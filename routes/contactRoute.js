const express = require("express");
const router = express.Router();
const { Contact } = require("../controllers/contactController");

router.post("/", Contact);

module.exports = router;

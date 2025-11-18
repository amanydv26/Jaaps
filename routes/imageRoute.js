const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadImages");
const { uploadImagesFromFolder } = require("../controllers/imagesController");

router.post("/", upload.array("images"), uploadImagesFromFolder);

module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../middleware/excel");
const {uploadProduct,uploadBulkProducts,getAllProducts ,markFeatured } = require('../controllers/productController')

router.post("/", uploadProduct);
router.post("/bulk", upload.single("file"), uploadBulkProducts);
router.get("/", getAllProducts);
router.patch("/feature" ,markFeatured );

module.exports = router;

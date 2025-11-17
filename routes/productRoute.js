const express = require("express");
const router = express.Router();
const upload = require("../middleware/excel");
const {uploadProduct,uploadBulkProducts,getAllProducts} = require('../controllers/productController')

router.post("/", uploadProduct);
router.post("/bulk", upload.single("file"), uploadBulkProducts);
router.get("/", getAllProducts);

module.exports = router;

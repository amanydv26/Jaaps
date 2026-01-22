const express = require('express');
const { uploadCatalogue, getCatalogues,getGroupedCatalogues,getGroupeddashboard ,deleteCatalogues} = require('../controllers/catalogueController');
const upload = require('../middleware/uploadpdf');

const router = express.Router();

router.post(
  "/",
  upload.single("file"),
  uploadCatalogue
);
router.get('/', getCatalogues);
router.delete("/", deleteCatalogues);
router.get('/grouped' , getGroupedCatalogues);
router.get('/dashboard',getGroupeddashboard)

module.exports = router;

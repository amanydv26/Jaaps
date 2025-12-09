const express = require('express');
const { uploadCatalogue, getCatalogues,getGroupedCatalogues } = require('../controllers/catalogueController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', upload.single('catalogueFile'), uploadCatalogue);
router.get('/', getCatalogues);
router.get('/grouped' , getGroupedCatalogues);
module.exports = router;

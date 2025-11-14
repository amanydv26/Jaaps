const express = require('express');
const { uploadCatalogue, getCatalogues } = require('../controllers/catalogueController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', upload.single('catalogueFile'), uploadCatalogue);
router.get('/', getCatalogues);

module.exports = router;

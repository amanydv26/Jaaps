const express = require('express')
const router = express.Router();
const {getAllCategories} = require('../controllers/categoryController')

//fetching catagories 
router.get('/' , getAllCategories) ;

module.exports = router;
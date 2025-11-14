const express = require('express');
const router = express.Router();
const { 
  getUser, 
  getVerifiedUser, 
  getNotVerifiedUser, 
  updateStatus 
} = require('../../../controllers/adminController');

// router.get('/list', (req, res) => {
//     res.send("User management working");
// });

router.get('/', getUser);
//router.get('/verified', getVerifiedUser);
//router.get('/notverified', getNotVerifiedUser);
router.patch('/:id', updateStatus);

module.exports = router;

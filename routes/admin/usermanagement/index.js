const express = require('express');
const router = express.Router();
const { 
  getUser, 
  getVerifiedUser, 
  getNotVerifiedUser, 
  updateStatus ,
  adminCreateCredentials,
  deactivateUser,
  deleteUser,
  updateUserCataloguePermissions 

} = require('../../../controllers/adminController');

// router.get('/list', (req, res) => {
//     res.send("User management working");
// });

router.get('/', getUser);
//router.get('/verified', getVerifiedUser);
//router.get('/notverified', getNotVerifiedUser);
router.patch('/:id', updateStatus);
router.patch('/credentials/:userId',adminCreateCredentials)
router.patch("/deactivate/:userId", deactivateUser);
router.delete("/delete/:userId", deleteUser);
router.patch("/catalogue-permissions/:userId", updateUserCataloguePermissions);
module.exports = router;


const express = require('express');
const router = express.Router();

const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getSpecialists,
  getUsersByRole,
  updatePassword,
  getDeletedUsers,
  restoreUser
} = require("../adapters/controllers/UserController");

 const { isAuthenticated } = require('../middlewares/authMiddleware');
//  router.use(isAuthenticated);

router.get('/deleted', getDeletedUsers);

router.post('/:id/restore',  restoreUser);


router.get('/specialists', getSpecialists);
router.get('/', getAllUsers);
router.get('/:id', isAuthenticated, getUserById);
router.get('/role/:roleId', isAuthenticated, getUsersByRole);  
router.post('/',  createUser);
router.put('/:id', isAuthenticated, updateUser);
router.put('/:id/password', updatePassword);
router.delete('/:id', isAuthenticated, deleteUser);

module.exports = router;

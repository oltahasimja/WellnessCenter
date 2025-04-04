
const express = require('express');
const router = express.Router();

const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getSpecialists,
  getUsersByRole
} = require("../adapters/controllers/UserController");

 const { isAuthenticated } = require('../middlewares/authMiddleware');
//  router.use(isAuthenticated);


router.get('/specialists', getSpecialists);
router.get('/', isAuthenticated, getAllUsers);
router.get('/:id', isAuthenticated, getUserById);
router.get('/role/:roleId', isAuthenticated, getUsersByRole);  
router.post('/', createUser);
router.put('/:id', isAuthenticated, updateUser);
router.delete('/:id', isAuthenticated, deleteUser);

module.exports = router;

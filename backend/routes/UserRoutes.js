
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
 router.use(isAuthenticated);


router.get('/specialists', getSpecialists);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/role/:roleId', getUsersByRole);  
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

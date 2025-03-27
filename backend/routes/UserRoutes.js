
const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getSpecialists,
  getUsersByRole
} = require("../adapters/controllers/UserController");

const router = express.Router();

router.get('/specialists', getSpecialists);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/role/:roleId', getUsersByRole);  
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

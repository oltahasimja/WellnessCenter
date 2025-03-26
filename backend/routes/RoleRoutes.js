
const express = require('express');
const { 
  getAllRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole
} = require("../adapters/controllers/RoleController");
const router = express.Router();
router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);
module.exports = router;

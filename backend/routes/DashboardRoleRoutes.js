
const express = require('express');

const router = express.Router();

const { 
  getAllDashboardRoles, 
  getDashboardRoleById, 
  createDashboardRole, 
  updateDashboardRole, 
  deleteDashboardRole
} = require("../adapters/controllers/DashboardRoleController");



// const { isAuthenticated } = require('../middlewares/authMiddleware');
//  router.use(isAuthenticated);


router.get('/', getAllDashboardRoles);
router.get('/:id', getDashboardRoleById);
router.post('/', createDashboardRole);
router.put('/:id', updateDashboardRole);
router.delete('/:id', deleteDashboardRole);
module.exports = router;

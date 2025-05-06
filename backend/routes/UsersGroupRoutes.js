
const express = require('express');

const router = express.Router();

const { 
  getAllUsersGroups, 
  getUsersGroupById, 
  createUsersGroup, 
  updateUsersGroup, 
  deleteUsersGroup
} = require("../adapters/controllers/UsersGroupController");



// const { isAuthenticated } = require('../middlewares/authMiddleware');
//  router.use(isAuthenticated);


router.get('/', getAllUsersGroups);
router.get('/:id', getUsersGroupById);
router.post('/', createUsersGroup);
router.put('/:id', updateUsersGroup);
router.delete('/:id', deleteUsersGroup);
module.exports = router;

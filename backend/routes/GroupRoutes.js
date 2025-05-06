
const express = require('express');

const router = express.Router();

const { 
  getAllGroups, 
  getGroupById, 
  createGroup, 
  updateGroup, 
  deleteGroup
} = require("../adapters/controllers/GroupController");



// const { isAuthenticated } = require('../middlewares/authMiddleware');
//  router.use(isAuthenticated);


router.get('/', getAllGroups);
router.get('/:id', getGroupById);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
module.exports = router;

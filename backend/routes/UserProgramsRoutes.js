
const express = require('express');
const { 
  getAllUserProgramss, 
  getUserProgramsById, 
  createUserPrograms, 
  updateUserPrograms, 
  deleteUserPrograms
} = require("../adapters/controllers/UserProgramsController");
const router = express.Router();
router.get('/', getAllUserProgramss);
router.get('/:id', getUserProgramsById);
router.post('/', createUserPrograms);
router.put('/:id', updateUserPrograms);
router.delete('/:id', deleteUserPrograms);
module.exports = router;

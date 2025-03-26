
const express = require('express');
const { 
  getAllPrograms, 
  getProgramById, 
  createProgram, 
  updateProgram, 
  deleteProgram
} = require("../adapters/controllers/ProgramController");
const router = express.Router();
router.get('/', getAllPrograms);
router.get('/:id', getProgramById);
router.post('/', createProgram);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);
module.exports = router;

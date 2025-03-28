
const express = require('express');
const { 
  getAllTrainings, 
  getTrainingById, 
  createTraining, 
  updateTraining, 
  deleteTraining
} = require("../adapters/controllers/TrainingController");
const router = express.Router();
router.get('/', getAllTrainings);
router.get('/:id', getTrainingById);
router.post('/', createTraining);
router.put('/:id', updateTraining);
router.delete('/:id', deleteTraining);
module.exports = router;

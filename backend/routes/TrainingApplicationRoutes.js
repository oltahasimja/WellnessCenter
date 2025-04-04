
const express = require('express');
const { 
  getAllTrainingApplications, 
  getTrainingApplicationById, 
  createTrainingApplication, 
  updateTrainingApplication, 
  deleteTrainingApplication
} = require("../adapters/controllers/TrainingApplicationController");
const router = express.Router();
router.get('/', getAllTrainingApplications);
router.get('/:id', getTrainingApplicationById);
router.post('/', createTrainingApplication);
router.put('/:id', updateTrainingApplication);
router.delete('/:id', deleteTrainingApplication);
module.exports = router;

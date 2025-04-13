
const express = require('express');
const { 
  getAllScheduleTrainings, 
  getScheduleTrainingById, 
  createScheduleTraining, 
  updateScheduleTraining, 
  deleteScheduleTraining
} = require("../adapters/controllers/ScheduleTrainingController");
const router = express.Router();
router.get('/', getAllScheduleTrainings);
router.get('/:id', getScheduleTrainingById);
router.post('/', createScheduleTraining);
router.put('/:id', updateScheduleTraining);
router.delete('/:id', deleteScheduleTraining);
module.exports = router;

const express = require('express');
const { 
  getAllSchedules, 
  getScheduleById, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule
} = require("../adapters/controllers/ScheduleController");
const { isAuthenticated } = require("../middlewares/authMiddleware"); 

const router = express.Router();

router.get('/', getAllSchedules);
router.get('/:id', getScheduleById);
router.post('/', isAuthenticated, createSchedule);
router.put('/:id', isAuthenticated, updateSchedule);
router.delete('/:id', isAuthenticated, deleteSchedule);

module.exports = router;

// models/ScheduleMongo.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduleTrainingSchema = new Schema({
  mysqlId: {
    type: String,
    unique: true,
    index: true  

  },
  trainingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TrainingMongo' 
  },
  workDays: {
    type: [String], // ['Monday', 'Tuesday', 'Wednesday']
    required: true
  },
  startTime: {
    type: String, // "08:00"
    required: true
  },
  endTime: {
    type: String, // "17:00"
    required: true
  },
}, { timestamps: true });

const scheduleTrainingSchema = mongoose.model('ScheduleTrainingMongo', ScheduleTrainingSchema);
module.exports = scheduleTrainingSchema;

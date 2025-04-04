// models/ScheduleMongo.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
  mysqlId: {
    type: String,
    unique: true,
    index: true  

  },
  specialistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserMongo' 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo'
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
  breakStartTime: {
    type: String, // "12:00"
    default: null
  },
  breakEndTime: {
    type: String, // "13:00"
    default: null
  },
  unavailableDates: {
    type: [String], // ['2025-04-10', '2025-04-15']
    default: []
  }
}, { timestamps: true });

const ScheduleMongo = mongoose.model('ScheduleMongo', scheduleSchema);
module.exports = ScheduleMongo;

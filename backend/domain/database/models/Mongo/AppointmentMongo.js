const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    unique: true, 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo', 
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'canceled', 'completed'],
    default: 'pending',
  },
  type: {
    type: String,
    enum: ['training', 'nutrition', 'therapy', 'mental_performance'],
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
}, { timestamps: true });

const AppointmentMongo = mongoose.model('AppointmentMongo', appointmentSchema);
module.exports = AppointmentMongo;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrainingSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String, 
    required: false
  },
  duration: {
    type: String, // Shprehja e kohëzgjatjes si string
    required: true
  },
  max_participants: {
    type: Number,
    required: true,
    default: 30
  }
}, { timestamps: true });

const Training = mongoose.model('TrainingMongo', TrainingSchema);

module.exports = Training;
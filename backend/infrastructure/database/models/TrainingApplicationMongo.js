const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema për TrainingApplicationMongo
const TrainingApplicationMongoSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingMongo',
    required: true,
  },
  status: {
    type: String,
    enum: ['në pritje', 'miratuar', 'refuzuar'],
    default: 'në pritje',
    required: true,
  },
  applicationDate: {
    type: Date,
    default: Date.now,
    required: true,
  }
}, { timestamps: true });

// Krijo lidhjet e modeleve me përdoruesit dhe trajnimet
const TrainingApplicationMongo = mongoose.model('TrainingApplicationMongo', TrainingApplicationMongoSchema);

module.exports = TrainingApplicationMongo;

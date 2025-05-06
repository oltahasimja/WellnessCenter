const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CertificationSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  issuingOrganization: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  issueDate: {
    type: Date,
    required: false
  },
  expiryDate: {
    type: Date,
    required: false // Optional if certification doesn't expire
  },
  credentialId: {
    type: String,
    required: false // Unique certification ID if available
  },
  
  credentialUrl: {
    type: String,
    required: false // URL to verify certification online
  },
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
}, { timestamps: true });



const Certification = mongoose.model('CertificationMongo', CertificationSchema);

module.exports = Certification;
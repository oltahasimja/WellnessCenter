
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileImageSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    index: true 
  },
  name: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Create model from schema
const ProfileImage = mongoose.model('ProfileImageMongo', ProfileImageSchema);

module.exports = ProfileImage;

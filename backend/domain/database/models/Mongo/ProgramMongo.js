const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const programSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProgramMongo = mongoose.model('ProgramMongo', programSchema);
module.exports = ProgramMongo;
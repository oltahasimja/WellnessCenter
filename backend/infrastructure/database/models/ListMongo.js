const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
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
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramMongo',
    required: true,
  },
});

const ListMongo = mongoose.model('ListMongo', listSchema);
module.exports = ListMongo;

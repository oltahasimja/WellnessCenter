const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
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
    type: Schema.Types.ObjectId,
    ref: 'UsersMongo',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GroupMongo = mongoose.model('GroupMongo', groupSchema);
module.exports = GroupMongo;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userGroupSchema = new Schema({
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
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupMongo',
    required: true,
  },
 
  createdAt: { type: Date, default: Date.now },
});

const UserGroupMongo = mongoose.model('UserGroupMongo', userGroupSchema);
module.exports = UserGroupMongo;
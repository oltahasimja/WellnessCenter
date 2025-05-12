const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  mysqlId: { type: String },
  text: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupMongo',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  systemMessage: { type: Boolean, default: false },
  seenBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserMongo'
    },
    seenAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const MessageMongo = mongoose.model('MessageMongo', MessageSchema);

module.exports = MessageMongo;
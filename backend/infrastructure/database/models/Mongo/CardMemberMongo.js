const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardMemberSchema = new Schema({
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
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CardMongo',
    required: true,
  },
  invitedById: {  // The creator who invited the client
    type: String,
    required: false,
  },
  createdAt: { type: Date, default: Date.now },
});

const CardMemberMongo = mongoose.model('CardMemberMongo', CardMemberSchema);
module.exports = CardMemberMongo;
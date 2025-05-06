const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProgramsSchema = new Schema({
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
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramMongo',
    required: true,
  },
  invitedById: {  // The creator who invited the client
    type: String,
    required: false,
  },
  createdAt: { type: Date, default: Date.now },
});

const UserProgramsMongo = mongoose.model('UserProgramsMongo', userProgramsSchema);
module.exports = UserProgramsMongo;
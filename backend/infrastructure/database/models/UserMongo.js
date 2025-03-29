const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    unique: true, 
  },
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,

  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  
  country: {
    type: String, 
  },
  city: {
    type: String, 
  },

  profileImage: {
    type: String, 
  },

  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoleMongo' }, // Referenca e saktë

});


const UserMongo = mongoose.model('UserMongo', userSchema);
module.exports = UserMongo;
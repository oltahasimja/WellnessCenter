const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    unique: true, 
    index: true  
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
    unique: true,
    index: true  
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true 
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
  profileImageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProfileImageMongo', 
    index: true  
  },
  roleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RoleMongo', 
    index: true  
  },

  dashboardRoleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DashboardRoleMongo', 
    index: true  
  },
  countryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CountryMongo', 
    index: true  
  },
  cityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CityMongo', 
    index: true  
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

const UserMongo = mongoose.model('UserMongo', userSchema);
module.exports = UserMongo;

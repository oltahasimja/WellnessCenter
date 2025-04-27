
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  // Change _id to mysqlId as a separate field rather than trying to override MongoDB's _id
  mysqlId: {
    type: String,
    required: true,
    index: true  // Add index for faster queries
  },
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Create model from schema
const Role = mongoose.model('RoleMongo', RoleSchema);

module.exports = Role;

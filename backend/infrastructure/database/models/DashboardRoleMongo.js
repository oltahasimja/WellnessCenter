
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  mysqlId: {
    type: String,
    required: true,
    index: true  
  },
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

const DashboardRole = mongoose.model('DashboardRoleMongo', RoleSchema);

module.exports = DashboardRole;

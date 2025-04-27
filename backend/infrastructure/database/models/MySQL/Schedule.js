// models/Schedule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');
const User = require('./User');

const Schedule = sequelize.define('Schedule', {
  specialistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Changed to string reference
      key: 'id',
    },
    unique: true
  },
  workDays: {
    type: DataTypes.JSON, // ['Monday', 'Tuesday', 'Wednesday']
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME, // ora e fillimit të punës
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME, // ora e përfundimit të punës
    allowNull: false,
  },
  breakStartTime: {
    type: DataTypes.TIME, // ora e fillimit të pushimit
    allowNull: true,
  },
  breakEndTime: {
    type: DataTypes.TIME, // ora e përfundimit të pushimit
    allowNull: true,
  },
  unavailableDates: {
    type: DataTypes.JSON, // ['2025-04-10', '2025-04-15']
    allowNull: true,
  },
}, {
  timestamps: true
});

// User.hasOne(Schedule, { foreignKey: 'specialistId' });
// Schedule.belongsTo(User, { foreignKey: 'specialistId' });

module.exports = Schedule;

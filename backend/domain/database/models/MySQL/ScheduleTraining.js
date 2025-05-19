// models/Schedule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const ScheduleTraining = sequelize.define('ScheduleTraining', {
    trainingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Trainings',
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
}, {
  timestamps: true
});



module.exports = ScheduleTraining;

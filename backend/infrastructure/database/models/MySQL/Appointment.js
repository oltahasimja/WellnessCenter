const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Appointment = sequelize.define('Appointment', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',  
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  specialistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',  
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'canceled', 'completed'),
    defaultValue: 'pending',
  },
  type: {
    type: DataTypes.ENUM('training', 'nutrition', 'therapy', 'mental_performance'),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Appointment;
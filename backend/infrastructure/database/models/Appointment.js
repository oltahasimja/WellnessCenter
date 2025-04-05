const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const User = require('./User');

const Appointment = sequelize.define('Appointment', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  specialistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
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

User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
User.hasMany(Appointment, { foreignKey: 'specialistId', as: 'clients' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'client' });
Appointment.belongsTo(User, { foreignKey: 'specialistId', as: 'specialist' });

module.exports = Appointment;

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const User = require('../models/User');

const Program = sequelize.define('Program', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdById: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

// Relationship: One User (Trainer/Nutritionist/Psychologist) creates multiple programs
User.hasMany(Program, { foreignKey: 'createdById' });
Program.belongsTo(User, { foreignKey: 'createdById' });

module.exports = Program;
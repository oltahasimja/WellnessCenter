const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

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
      model: 'Users',  
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



module.exports = Program;
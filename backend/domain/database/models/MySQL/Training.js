const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Training = sequelize.define("Training", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, 
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Changed to string reference
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  duration: {
    type: DataTypes.STRING,  
    allowNull: false
  },
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10, 
  }
}, {
  timestamps: false 
});

module.exports = Training;
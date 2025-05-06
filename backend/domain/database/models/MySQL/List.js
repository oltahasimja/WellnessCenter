const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');


const List = sequelize.define('List', { 
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdById: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users', // Use string name instead of direct model reference
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Programs', // Use string name instead of direct model reference
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE', // You had this missing in your model definition
  }
}, {
  timestamps: true,
  updatedAt: 'updatedAt', // Explicitly define if needed
});


  
  module.exports = List;
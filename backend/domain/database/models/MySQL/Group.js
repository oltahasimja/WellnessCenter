const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');


const Group = sequelize.define('Group', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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





module.exports = Group;
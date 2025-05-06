const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');
const Users = require('./User');

const Log = sequelize.define('Log', {
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
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'logs',
  timestamps: true,        
});

module.exports = Log;
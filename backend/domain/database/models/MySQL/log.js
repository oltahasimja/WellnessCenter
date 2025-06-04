const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');
const Users = require('./User');
const Programs = require('./Program');

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
  },    programId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Programs',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
}, {
  tableName: 'logs',
  timestamps: true,        
});

module.exports = Log;
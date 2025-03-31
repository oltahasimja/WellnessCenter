const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const User = require('../models/User');
const Program = require('../models/Program');


const List = sequelize.define('List', { 
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    programId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Program,
        key: 'id',
      },
      onDelete: 'CASCADE',
    }
  }, {
    timestamps: true,
  });
  sequelize.sync();
  // Një program ka shumë lista
  Program.hasMany(List, { foreignKey: 'programId' });
  List.belongsTo(Program, { foreignKey: 'programId' });
  
  module.exports = List;
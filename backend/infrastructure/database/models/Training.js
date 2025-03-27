const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Training = sequelize.define("Training", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // Në ditë ose orë
    allowNull: false,
  },
});

module.exports = Training;

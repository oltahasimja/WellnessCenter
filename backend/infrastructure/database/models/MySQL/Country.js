const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Country = sequelize.define('Country', {
   name: {
       type: DataTypes.STRING,
       allowNull: false,
   }
});

module.exports = Country;

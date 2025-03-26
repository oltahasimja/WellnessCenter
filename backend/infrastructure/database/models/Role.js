const { DataTypes } = require('sequelize');
const sequelize = require("../../../config/database");

const Role = sequelize.define('Role', {

   name: {
       type: DataTypes.STRING,
       allowNull: false,
   }

})

sequelize.sync();


module.exports = Role;






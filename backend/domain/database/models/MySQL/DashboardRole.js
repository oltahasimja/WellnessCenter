const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const DashboardRole = sequelize.define('DashboardRole', {

   name: {
       type: DataTypes.STRING,
       allowNull: false,
   }

})

sequelize.sync();


module.exports = DashboardRole;






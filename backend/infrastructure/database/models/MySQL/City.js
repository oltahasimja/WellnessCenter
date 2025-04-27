const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');
const Country = require('./Country');

const City = sequelize.define('City', {
   name: {
       type: DataTypes.STRING,
       allowNull: false,
   },
   countryId: {
       type: DataTypes.INTEGER,
       references: {
           model: Country,
           key: 'id',
       },
       onDelete: 'CASCADE',
       onUpdate: 'CASCADE',
   }
});

Country.hasMany(City, { foreignKey: 'countryId' });
City.belongsTo(Country, { foreignKey: 'countryId' });

module.exports = City;

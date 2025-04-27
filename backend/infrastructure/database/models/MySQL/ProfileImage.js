const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const ProfileImage = sequelize.define('ProfileImage', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      // unique: true 
    },
    userId: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    }
  });

sequelize.sync();


module.exports = ProfileImage;






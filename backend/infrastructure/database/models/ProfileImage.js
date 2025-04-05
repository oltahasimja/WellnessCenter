const { DataTypes } = require('sequelize');
const sequelize = require("../../../config/database");

const ProfileImage = sequelize.define('ProfileImage', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true // Kjo ndihmon për të shmangur dyfishimin
    },
    userId: { // Shto këtë fushe për të lidhur direkt me përdoruesin
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    }
  });

sequelize.sync();


module.exports = ProfileImage;






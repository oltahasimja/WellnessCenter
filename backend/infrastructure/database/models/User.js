const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const Role = require('../models/Role');
const Country = require('../models/Country');
const City = require('../models/City');
const ProfileImage = require('../models/ProfileImage');
const DashboardRole = require('../models/DashboardRole');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    index: true  
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    index: true  
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
 
  roleId: { 
    type: DataTypes.INTEGER,
    references: {
        model: Role,  
        key: 'id',      
    },
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE',
    index: true  
  },
  dashboardRoleId: { 
    type: DataTypes.INTEGER,
    references: {
        model: DashboardRole,  
        key: 'id',      
    },
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE',
    index: true  
  },
  countryId: {
    type: DataTypes.INTEGER,
    references: {
        model: Country,
        key: 'id',
    },
    allowNull: true,
  },
  cityId: {
    type: DataTypes.INTEGER,
    references: {
        model: City,
        key: 'id',
    },
    allowNull: true,
  },
  profileImageId: {
    type: DataTypes.INTEGER,  
    references: {
      model: ProfileImage,   
      key: 'id',
    },
    allowNull: true,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

DashboardRole.hasMany(User, { foreignKey: 'dashboardRoleId' });
User.belongsTo(DashboardRole, { foreignKey: 'dashboardRoleId' });

Country.hasMany(User, { foreignKey: 'countryId' });
User.belongsTo(Country, { foreignKey: 'countryId' });

City.hasMany(User, { foreignKey: 'cityId' });
User.belongsTo(City, { foreignKey: 'cityId' });

ProfileImage.hasMany(User, { foreignKey: 'profileImageId' });
User.belongsTo(ProfileImage, { foreignKey: 'profileImageId' });

module.exports = User;

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
        model: 'Roles',  
        key: 'id',      
      },
      onDelete: 'CASCADE', 
      onUpdate: 'CASCADE',
      index: true  
    },
    dashboardRoleId: { 
      type: DataTypes.INTEGER,
      references: {
        model: 'DashboardRoles',  
        key: 'id',      
      },
      onDelete: 'CASCADE', 
      onUpdate: 'CASCADE',
      index: true  
    },
    countryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Countries',
        key: 'id',
      },
      allowNull: true,
    },
    cityId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Cities',
        key: 'id',
      },
      allowNull: true,
    },
    profileImageId: {
      type: DataTypes.INTEGER,  
      references: {
        model: 'ProfileImages',   
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

  return User;
};
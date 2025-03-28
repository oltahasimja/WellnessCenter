const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const Role = require('../models/Role');


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
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profileImage: {
    type: DataTypes.TEXT, 
  },
  roleId: { 
    type: DataTypes.INTEGER,
    references: {
        model: Role,  
        key: 'id',      
    },
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE',
},

});


Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

module.exports = User;




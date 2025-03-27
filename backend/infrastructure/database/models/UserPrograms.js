const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const User = require('../models/User');
const Program = require('../models/Program');

const UserPrograms = sequelize.define('UserPrograms', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Program,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  invitedById: {  // The creator who invited the client
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,  
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  status: {  // Invitation status (Pending, Accepted, Rejected)
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
    defaultValue: 'Pending',
  },
}, {
  timestamps: true,
});

User.belongsToMany(Program, { through: UserPrograms, foreignKey: 'userId' });
Program.belongsToMany(User, { through: UserPrograms, foreignKey: 'programId' });

module.exports = UserPrograms;

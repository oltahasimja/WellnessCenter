const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');


const UserPrograms = sequelize.define('UserPrograms', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
  

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Programs',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  invitedById: {  // The creator who invited the client
    type: DataTypes.STRING,
    allowNull: true,
  
  },
  // status: {  // Invitation status (Pending, Accepted, Rejected)
  //   type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
  //   defaultValue: 'Pending',
  // },
}, {
  timestamps: true,
});

// User.belongsToMany(Program, { through: UserPrograms, foreignKey: 'userId' });
// Program.belongsToMany(User, { through: UserPrograms, foreignKey: 'programId' });

module.exports = UserPrograms;

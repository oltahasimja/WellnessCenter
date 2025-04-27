const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const CardMember = sequelize.define('CardMember', {
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
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cards',
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


module.exports = CardMember;

const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const User = require('../models/User');
const Card = require('../models/Card');

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
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Card,
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

User.belongsToMany(Card, { through: CardMember, foreignKey: 'userId' });
Card.belongsToMany(User, { through: CardMember, foreignKey: 'cardId' });

module.exports = CardMember;

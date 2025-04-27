const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true, 
  },
  clientData: {
    type: DataTypes.JSON, 
    allowNull: false,
  },
  cart: {
    type: DataTypes.JSON, 
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,  
  },
}, { timestamps: true });

module.exports = Order;
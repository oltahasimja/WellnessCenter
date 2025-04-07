const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Order = sequelize.define("Order", {

  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productName: {  
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  pricePerUnit: {  
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,  
});

module.exports = Order;

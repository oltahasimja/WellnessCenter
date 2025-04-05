const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Order = sequelize.define("Order", {
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    index: true, 
  },
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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending', 
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  mysqlId: {
    type: DataTypes.STRING,  
    allowNull: true,
    index: true, 
  }
}, {
  timestamps: true,  
});

module.exports = Order;

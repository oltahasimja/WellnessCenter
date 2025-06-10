const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');
const Order = require('./Order');

const Delivery = sequelize.define('Delivery', {

  orderId: {
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: Order,
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Delivery',
  tableName: 'deliveries',
  timestamps: true,
});

module.exports = Delivery;




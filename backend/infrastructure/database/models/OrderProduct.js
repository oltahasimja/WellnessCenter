const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const Order = require('./Order');
const Product = require('./Product');

const OrderProduct = sequelize.define('OrderProduct', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mysqlId: {
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
}, {
  freezeTableName: true, 
  tableName: 'order_product', 
  timestamps: true,
//   indexes: [
//     {
//       name: 'order_product_mysql_id_index',
//       fields: ['mysqlId']
//     },
//     {
//       unique: true,
//       fields: ['orderId', 'productId']
//     }
//   ]
});


Order.belongsToMany(Product, {
  through: OrderProduct,
  foreignKey: 'orderId',
  otherKey: 'productId',
  as: 'products'
});

Product.belongsToMany(Order, {
  through: OrderProduct,
  foreignKey: 'productId',
  otherKey: 'orderId',
  as: 'orders'
});

module.exports = OrderProduct;

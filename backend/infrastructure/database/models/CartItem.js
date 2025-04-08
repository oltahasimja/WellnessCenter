const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database');
const Product = require('./Product');
const Cart = require('./Cart');

class CartItem extends Model {}

CartItem.init(
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cartId: {
      type: DataTypes.INTEGER,
      references: {
        model: Cart,
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: true,
  }
);

// Associations
CartItem.belongsTo(Product, { foreignKey: 'productId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' }); // Ensure CartItem belongs to Cart

// Define reverse relationships
Product.hasMany(CartItem, { foreignKey: 'productId' }); // Product has many CartItems
Cart.hasMany(CartItem, { foreignKey: 'cartId' }); // Cart has many CartItems

module.exports = CartItem;

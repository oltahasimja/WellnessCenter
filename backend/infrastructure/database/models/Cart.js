const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database'); // Make sure the path is correct
const Product = require('./Product'); // Reference the Product model
const CartItem = require('./CartItem');

const Cart = sequelize.define('Cart', {
  userId: {
    type: DataTypes.INTEGER, // Assuming you're using INTEGER for the user ID
    allowNull: true,
    references: {
      model: 'Users', // Adjust this to the correct table name for users
      key: 'id',
    },
  },
});


module.exports = Cart;

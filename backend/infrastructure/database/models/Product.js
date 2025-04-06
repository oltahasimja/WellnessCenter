const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const Category= require('./Category');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id',
    }},
  image: {
    type: DataTypes.STRING,
  },
});

// relacioni
Product.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = Product;

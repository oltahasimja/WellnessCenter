const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');
const Product = require('./Product');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});


 Review.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Review;


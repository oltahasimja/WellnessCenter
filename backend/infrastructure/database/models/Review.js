const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const User = require('./User');         // Assuming you have a User model
const Product = require('./Product');   // Assuming you have a Product model
//const Service = require('../Service');   // Assuming you have a Service model

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
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

// Associations
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });
//Review.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = Review;


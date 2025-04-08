const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database');
const Category = require('./Category');
const CartItem = require('./CartItem');

// Define Product model as a subclass of Sequelize.Model
class Product extends Model {}

// Initialize the Product model
Product.init(
  {
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
        model: Category,  // Foreign key referencing Category
        key: 'id',
      },
    },
    image: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize, // Pass the Sequelize instance
    modelName: 'Product', // Model name
    tableName: 'products', // Optional, if you want to specify the table name
    timestamps: true, // Optional, if you want timestamps like createdAt and updatedAt
  }
);

// Define associations
Product.belongsTo(Category, { foreignKey: 'categoryId' });


module.exports = Product;

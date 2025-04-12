const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database');
const Category = require('./Category');


class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // This will automatically generate a unique UUID
      allowNull: false,
      primaryKey: true,
    },
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
      },
    },
    image: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize, 
    modelName: 'Product', 
    tableName: 'products', 
    timestamps: true, 
  }
);

// asocimet
Product.belongsTo(Category, { foreignKey: 'categoryId' });


module.exports = Product;

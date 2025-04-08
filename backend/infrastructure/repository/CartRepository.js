const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Cart = require("../database/models/Cart");
const CartMongo = require("../database/models/CartMongo");
const User = require("../database/models/User");
const UserMongo = require("../database/models/UserMongo");
const Product = require("../database/models/Product");
const ProductMongo = require("../database/models/ProductMongo");


class CartRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await CartMongo.find().populate([{ path: 'userId', model: 'UserMongo' }, { path: 'productId', model: 'ProductMongo' }, { path: 'cartId', model: 'CartMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Cart.findAll({ include: [{ model: User }, { model: Product }, { model: Cart }] });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await CartMongo.findOne({ mysqlId: id }).populate([{ path: 'userId', model: 'UserMongo' }, { path: 'productId', model: 'ProductMongo' }, { path: 'cartId', model: 'CartMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Cart.findByPk(id, { include: [{ model: User }, { model: Product }, { model: Cart }] });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Cart:", data);
      
      // First create in MySQL
      const mysqlResource = await Cart.create(data);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data
      };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.userId) {
        // Find the related document in MongoDB
        const user = await UserMongo.findOne({ mysqlId: data.userId.toString() });
        if (!user) {
          throw new Error(`User with MySQL ID ${data.userId} not found in MongoDB`);
        }
        mongoData.userId = new ObjectId(user._id.toString());
      }

      if (data.productId) {
        // Find the related document in MongoDB
        const product = await ProductMongo.findOne({ mysqlId: data.productId.toString() });
        if (!product) {
          throw new Error(`Product with MySQL ID ${data.productId} not found in MongoDB`);
        }
        mongoData.productId = new ObjectId(product._id.toString());
      }

      if (data.cartId) {
        // Find the related document in MongoDB
        const cart = await CartMongo.findOne({ mysqlId: data.cartId.toString() });
        if (!cart) {
          throw new Error(`Cart with MySQL ID ${data.cartId} not found in MongoDB`);
        }
        mongoData.cartId = new ObjectId(cart._id.toString());
      }
      
      // Create in MongoDB
      const mongoResource = await CartMongo.create(mongoData);
      console.log("Cart saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Cart:", error);
      throw new Error('Error creating Cart: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Cart.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Cart not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.userId) {
        // Find the related document in MongoDB
        const user = await UserMongo.findOne({ mysqlId: data.userId.toString() });
        if (!user) {
          throw new Error(`User with MySQL ID ${data.userId} not found in MongoDB`);
        }
        mongoUpdateData.userId = new ObjectId(user._id.toString());
      }

      if (data.productId) {
        // Find the related document in MongoDB
        const product = await ProductMongo.findOne({ mysqlId: data.productId.toString() });
        if (!product) {
          throw new Error(`Product with MySQL ID ${data.productId} not found in MongoDB`);
        }
        mongoUpdateData.productId = new ObjectId(product._id.toString());
      }

      if (data.cartId) {
        // Find the related document in MongoDB
        const cart = await CartMongo.findOne({ mysqlId: data.cartId.toString() });
        if (!cart) {
          throw new Error(`Cart with MySQL ID ${data.cartId} not found in MongoDB`);
        }
        mongoUpdateData.cartId = new ObjectId(cart._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await CartMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Cart not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Cart:", error);
      throw new Error('Error updating Cart: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Cart.destroy({ where: { id } });
      
      // Delete from MongoDB
      await CartMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Cart:", error);
      throw new Error('Error deleting Cart: ' + error.message);
    }
  }
}

module.exports = new CartRepository();

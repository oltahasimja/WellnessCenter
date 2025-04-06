const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Category = require("../database/models/Category");
const CategoryMongo = require("../database/models/CategoryMongo");


class CategoryRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await CategoryMongo.find().lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Category.findAll({  });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await CategoryMongo.findOne({ mysqlId: id }).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Category.findByPk(id, {  });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Category:", data);
      
      // First create in MySQL
      const mysqlResource = await Category.create(data);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data
      };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      
      // Create in MongoDB
      const mongoResource = await CategoryMongo.create(mongoData);
      console.log("Category saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Category:", error);
      throw new Error('Error creating Category: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Category.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Category not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      
      // Update in MongoDB
      const updatedMongoDB = await CategoryMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Category not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Category:", error);
      throw new Error('Error updating Category: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Category.destroy({ where: { id } });
      
      // Delete from MongoDB
      await CategoryMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Category:", error);
      throw new Error('Error deleting Category: ' + error.message);
    }
  }
}

module.exports = new CategoryRepository();

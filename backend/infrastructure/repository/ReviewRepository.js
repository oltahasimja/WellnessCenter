const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const Review = require("../database/models/MySQL/Review");
const { ReviewMongo } = require('../database/models/indexMongo');
const ProductRepository = require('../repository/ProductRepository'); // Assuming we have a ProductRepository

class ReviewRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await ReviewMongo.find().lean();
    } catch (error) {
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // Fallback to MySQL if MongoDB fails
      return await Review.findAll();
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await ReviewMongo.findOne({ mysqlId: id }).lean();
    } catch (error) {
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // Fallback to MySQL if MongoDB fails
      return await Review.findByPk(id);
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Review:", data);
      
      // Ensure product exists in MySQL before proceeding
      const product = await ProductRepository.findByName(data.productName);
      if (!product) {
        throw new Error("Product does not exist.");
      }
      
      // First, create the review in MySQL
      const mysqlResource = await Review.create({
        productId: product.id, // Linking review to product
        ...data,
      });
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        productId: product.id,
        ...data
      };
      
      // Create in MongoDB
      const mongoResource = await ReviewMongo.create(mongoData);
      console.log("Review saved in MongoDB:", mongoResource);
      
      return mysqlResource; // Return the MySQL resource (as it's the primary source)
    } catch (error) {
      console.error("Error creating Review:", error);
      throw new Error('Error creating Review: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Review.update({ ...data }, { where: { id } });
  
      if (updatedCount === 0) {
        throw new Error("Review not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Update in MongoDB
      const updatedMongoDB = await ReviewMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Review not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Review:", error);
      throw new Error('Error updating Review: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Review.destroy({ where: { id } });
      
      // Delete from MongoDB
      await ReviewMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Review:", error);
      throw new Error('Error deleting Review: ' + error.message);
    }
  }
}

module.exports = new ReviewRepository();

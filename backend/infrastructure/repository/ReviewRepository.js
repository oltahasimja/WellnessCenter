
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;


const Review = require("../database/models/MySQL/Review");
const { ReviewMongo } = require('../database/models/indexMongo');



class ReviewRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await ReviewMongo.find().lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Review.findAll({  });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await ReviewMongo.findOne({ mysqlId: id }).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Review.findByPk(id, {  });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Review:", data);
      
      // First create in MySQL
      const mysqlResource = await Review.create(data);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data
      };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      
      // Create in MongoDB
      const mongoResource = await ReviewMongo.create(mongoData);
      console.log("Review saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Review:", error);
      throw new Error('Error creating Review: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Review.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Review not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      
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

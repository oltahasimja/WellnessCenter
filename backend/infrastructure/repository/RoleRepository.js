
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Role = require("../database/models/Role");
const RoleMongo = require("../database/models/RoleMongo");


class RoleRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await RoleMongo.find().lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Role.findAll({  });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await RoleMongo.findOne({ mysqlId: id }).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Role.findByPk(id, {  });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Role:", data);
      
      // First create in MySQL
      const mysqlResource = await Role.create(data);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data
      };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      
      // Create in MongoDB
      const mongoResource = await RoleMongo.create(mongoData);
      console.log("Role saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Role:", error);
      throw new Error('Error creating Role: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Role.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Role not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      
      // Update in MongoDB
      const updatedMongoDB = await RoleMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Role not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Role:", error);
      throw new Error('Error updating Role: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Role.destroy({ where: { id } });
      
      // Delete from MongoDB
      await RoleMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Role:", error);
      throw new Error('Error deleting Role: ' + error.message);
    }
  }
}

module.exports = new RoleRepository();

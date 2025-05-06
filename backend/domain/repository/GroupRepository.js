
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;


const { User, Group } = require("../database/models/index");
const { UserMongo, GroupMongo } = require("../database/models/indexMongo");


class GroupRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await GroupMongo.find().populate([{ path: 'createdById', model: 'UserMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Group.findAll({ include: [{ model: Users }] });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await GroupMongo.findOne({ mysqlId: id }).populate([{ path: 'createdById', model: 'UserMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Group.findByPk(id, { include: [{ model: Users }] });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Group:", data);
      
      // First create in MySQL
      const mysqlResource = await Group.create(data);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        name: data.name,
        createdAt: new Date()
      };
      
      // Handle createdById - find the user in MongoDB
      if (data.createdById) {
        const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (!user) {
          throw new Error(`User with MySQL ID ${data.createdById} not found in MongoDB`);
        }
        mongoData.createdById = user._id;
      }
      
      // Create in MongoDB
      const mongoResource = await GroupMongo.create(mongoData);
      console.log("Group saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Group:", error);
      throw new Error('Error creating Group: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Group.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Group not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.usersId) {
        // Find the related document in MongoDB
        const users = await UserMongo.findOne({ mysqlId: data.usersId.toString() });
        if (!users) {
          throw new Error(`Users with MySQL ID ${data.usersId} not found in MongoDB`);
        }
        mongoUpdateData.usersId = new ObjectId(users._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await GroupMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Group not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Group:", error);
      throw new Error('Error updating Group: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Group.destroy({ where: { id } });
      
      // Delete from MongoDB
      await GroupMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Group:", error);
      throw new Error('Error deleting Group: ' + error.message);
    }
  }
}

module.exports = new GroupRepository();

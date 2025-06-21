
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;


const { User, Group, UsersGroup } = require("../database/models/index");
const { UserMongo, GroupMongo, UsersGroupMongo } = require("../database/models/indexMongo");


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
      
      // Add creator to the group (MySQL)
      await UsersGroup.create({
        userId: data.createdById,
        groupId: mysqlResource.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add creator to the group (MongoDB)
      const mongoUserGroup = new UsersGroupMongo({
        mysqlId: `${data.createdById}-${mysqlResource.id}`, // or generate a unique ID
        userId: mongoData.createdById,
        groupId: mongoResource._id,
        createdAt: new Date()
      });
      await mongoUserGroup.save();
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Group:", error);
      throw new Error('Error creating Group: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // First check if group exists in MySQL
      const mysqlGroup = await Group.findByPk(id);
      if (!mysqlGroup) {
        throw new Error("Group not found in MySQL");
      }
  
      // Update in MySQL
      await mysqlGroup.update(data);
  
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
  
      // Handle createdById conversion if it's being updated
      if (data.createdById) {
        const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (!user) {
          throw new Error(`User with mysqlId ${data.createdById} not found in MongoDB`);
        }
        mongoUpdateData.createdById = user._id; // Use MongoDB ObjectId
      }
  
      // Handle usersId conversion if it's being updated
      if (data.usersId) {
        const users = await UserMongo.findOne({ mysqlId: data.usersId.toString() });
        if (!users) {
          throw new Error(`Users with MySQL ID ${data.usersId} not found in MongoDB`);
        }
        mongoUpdateData.usersId = users._id; // Use MongoDB ObjectId
      }
  
      // Update in MongoDB
      const updatedMongoDB = await GroupMongo.updateOne(
        { mysqlId: id.toString() }, // Ensure id is string
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Group not found in MongoDB or no changes made");
      }
  
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

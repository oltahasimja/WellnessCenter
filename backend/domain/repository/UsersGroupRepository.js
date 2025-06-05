const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const { UsersGroup, User, Group } = require("../database/models/index");
const { UserMongo, GroupMongo, UsersGroupMongo } = require("../database/models/indexMongo");

class UsersGroupRepository {
  // Read operations - Get from MongoDB with fallback to MySQL

 async findAll() {
  try {
    return await UsersGroupMongo.find()
      .populate({
        path: 'userId',
        model: 'UserMongo',
        populate: {
          path: 'profileImageId',
          select: 'name'
        }
      })
      .populate({
        path: 'groupId',
        model: 'GroupMongo'
      })
      .lean();
  } catch (error) {
    console.error("MongoDB findAll failed, falling back to MySQL:", error);
    throw new Error("Failed to retrieve UsersGroup data: " + error.message);
  }
}

  
  async findByGroupId(groupId) {
    try {
      // First, try to find the MongoDB ObjectId for the groupId
      let mongoGroupId;
      
      // Check if the groupId is already a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(groupId)) {
        mongoGroupId = new ObjectId(groupId);
      } else {
        // It might be a MySQL ID, so try to find the MongoDB document with that mysqlId
        const group = await GroupMongo.findOne({ mysqlId: groupId });
        if (!group) {
          throw new Error(`Group with ID ${groupId} not found in MongoDB`);
        }
        mongoGroupId = group._id;
      }
      
      // Find all UsersGroups with the given groupId, populated with user data
     return await UsersGroupMongo.find({ groupId: mongoGroupId })
  .populate({
    path: 'userId',
    model: 'UserMongo',
    populate: {
      path: 'profileImageId',
      select: 'name'
    }
  })
  .populate({
    path: 'groupId',
    model: 'GroupMongo'
  })
  .lean();

    } catch (error) {
      console.error("MongoDB findByGroupId failed:", error);
      throw new Error("Failed to retrieve UsersGroup data for group: " + error.message);
    }
  }
  
  async findById(id) {
    try {
      let query;
      
      // Check if the id is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        // Otherwise, assume it's a MySQL ID
        query = { mysqlId: id };
      }
      
      // Get from MongoDB with populated relationships
      return await UsersGroupMongo.findOne(query).populate([
        { path: 'userId', model: 'UserMongo' }, 
        { path: 'groupId', model: 'GroupMongo' }
      ]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await UsersGroup.findByPk(id, { include: [{ model: User }, { model: Group }] });
      throw new Error("Failed to retrieve UsersGroup: " + error.message);
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
 async create(data) {
  try {
    console.log("Creating UsersGroup:", data);
    
    // Handle case where userId is an array
    if (Array.isArray(data.userId)) {
      // Create an array of promises for each user-group relationship
      const createPromises = data.userId.map(async (userId) => {
        const singleData = {
          ...data,
          userId: userId
        };
        
        // First create in MySQL
        const mysqlResource = await UsersGroup.create(singleData);
        
        // Prepare data for MongoDB
        const mongoData = {
          mysqlId: mysqlResource.id.toString(),
          ...singleData
        };
        
        // Handle user reference
        const user = await UserMongo.findOne({ mysqlId: userId.toString() });
        if (!user) {
          throw new Error(`User with MySQL ID ${userId} not found in MongoDB`);
        }
        mongoData.userId = new ObjectId(user._id.toString());
        
        // Handle group reference
        if (data.groupId) {
          const group = await GroupMongo.findOne({ mysqlId: data.groupId.toString() });
          if (!group) {
            throw new Error(`Group with MySQL ID ${data.groupId} not found in MongoDB`);
          }
          mongoData.groupId = new ObjectId(group._id.toString());
        }
        
        // Create in MongoDB
        return UsersGroupMongo.create(mongoData);
      });
      
      // Wait for all creations to complete
      const results = await Promise.all(createPromises);
      console.log("UsersGroups saved in MongoDB:", results);
      
      return results;
    } else {
      // Original single-user implementation
      const mysqlResource = await UsersGroup.create(data);
      
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data
      };
      
      if (data.userId) {
        const user = await UserMongo.findOne({ mysqlId: data.userId.toString() });
        if (!user) {
          throw new Error(`User with MySQL ID ${data.userId} not found in MongoDB`);
        }
        mongoData.userId = new ObjectId(user._id.toString());
      }

      if (data.groupId) {
        const group = await GroupMongo.findOne({ mysqlId: data.groupId.toString() });
        if (!group) {
          throw new Error(`Group with MySQL ID ${data.groupId} not found in MongoDB`);
        }
        mongoData.groupId = new ObjectId(group._id.toString());
      }
      
      const mongoResource = await UsersGroupMongo.create(mongoData);
      console.log("UsersGroup saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    }
  } catch (error) {
    console.error("Error creating UsersGroup:", error);
    throw new Error('Error creating UsersGroup: ' + error.message);
  }
}

  
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await UsersGroup.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("UsersGroup not found in MySQL");
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

      if (data.groupId) {
        // Find the related document in MongoDB
        const group = await GroupMongo.findOne({ mysqlId: data.groupId.toString() });
        if (!group) {
          throw new Error(`Group with MySQL ID ${data.groupId} not found in MongoDB`);
        }
        mongoUpdateData.groupId = new ObjectId(group._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await UsersGroupMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("UsersGroup not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating UsersGroup:", error);
      throw new Error('Error updating UsersGroup: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await UsersGroup.destroy({ where: { id } });
      
      // Delete from MongoDB
      await UsersGroupMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting UsersGroup:", error);
      throw new Error('Error deleting UsersGroup: ' + error.message);
    }
  }
}

module.exports = new UsersGroupRepository();

const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;


const { List, User } = require('../database/models/index');
const { ListMongo, UserMongo, ProgramMongo  } = require('../database/models/indexMongo');


class ListRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await ListMongo.find().populate([{ path: 'createdById', model: 'UserMongo' }, { path: 'programId', model: 'ProgramMongo' }])
      .lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await List.findAll({  });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await ListMongo.findOne({ mysqlId: id })
      .populate([{ path: 'createdById', model: 'UserMongo' }, { path: 'programId', model: 'ProgramMongo' }])
      .lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await List.findByPk(id, {  });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating List:", data);
  
      // First create in MySQL
      const mysqlResource = await List.create(data);
  
      // Prepare data for MongoDB, remove _id to let MongoDB generate it automatically
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        name: data.name, // Only include fields that exist in your schema
        createdAt: new Date(),
      };
      
      // Only convert programId to ObjectId if it's a valid MongoDB ID
      // If it's a MySQL ID, we should look up the corresponding MongoDB document
      if (data.programId) {
        // Find the program in MongoDB that has this mysqlId
        const program = await ProgramMongo.findOne({ mysqlId: data.programId.toString() });
        if (program) {
          mongoData.programId = program._id;
        } else {
          console.warn(`Program with MySQL ID ${data.programId} not found in MongoDB`);
          // Either skip or handle this case appropriately
        }
      }
  
      // Handle createdById similarly
      if (data.createdById) {
        const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (user) {
          mongoData.createdById = user._id;
        } else {
          console.warn(`User with MySQL ID ${data.createdById} not found in MongoDB`);
          // Either skip or handle this case appropriately
        }
      }
  
      // Create in MongoDB
      const mongoResource = await ListMongo.create(mongoData);
      console.log("List saved in MongoDB:", mongoResource);
  
      return mysqlResource;
    } catch (error) {
      console.error("Error creating List:", error);
      throw new Error('Error creating List: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await List.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("List not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { 
        name: data.name, // Only include fields that need updating
        updatedAt: new Date() // Add updated timestamp
      };
      
      // Handle programId - find corresponding MongoDB document
      if (data.programId) {
        const program = await ProgramMongo.findOne({ mysqlId: data.programId.toString() });
        if (!program) {
          console.warn(`Program with MySQL ID ${data.programId} not found in MongoDB`);
        } else {
          mongoUpdateData.programId = program._id;
        }
      }
      
      // Handle createdById - find corresponding MongoDB document
      if (data.createdById) {
        const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (!user) {
          console.warn(`User with MySQL ID ${data.createdById} not found in MongoDB`);
        } else {
          mongoUpdateData.createdById = user._id;
        }
      }
      
      // Update in MongoDB
      const updatedMongoDB = await ListMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("List not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating List:", error);
      throw new Error('Error updating List: ' + error.message);
    }
  }
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await List.destroy({ where: { id } });
      
      // Delete from MongoDB
      await ListMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting List:", error);
      throw new Error('Error deleting List: ' + error.message);
    }
  }
}

module.exports = new ListRepository();

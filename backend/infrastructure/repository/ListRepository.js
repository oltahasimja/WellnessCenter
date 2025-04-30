const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Log = require('../database/models/MySQL/log');
const { List, User } = require('../database/models/index');
const { ListMongo, UserMongo, ProgramMongo } = require('../database/models/indexMongo');

class ListRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      return await ListMongo.find().populate([
        { path: 'createdById', model: 'UserMongo' }, 
        { path: 'programId', model: 'ProgramMongo' }
      ]).lean();
    } catch (error) {
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await List.findAll({});
    }
  }
  
  async findById(id) {
    try {
      return await ListMongo.findOne({ mysqlId: id })
        .populate([
          { path: 'createdById', model: 'UserMongo' }, 
          { path: 'programId', model: 'ProgramMongo' }
        ])
        .lean();
    } catch (error) {
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await List.findByPk(id, {});
    }
  }
  
  // Write operations with logging
  async create(data) {
    try {
      console.log("Creating List:", data);
  

      // First create in MySQL
      const mysqlResource = await List.create(data);

      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        name: data.name,
        createdAt: new Date(),
      };
      
      // Handle programId reference
      if (data.programId) {
        const program = await ProgramMongo.findOne({ mysqlId: data.programId.toString() });
        if (program) {
          mongoData.programId = program._id;
        } else {
          console.warn(`Program with MySQL ID ${data.programId} not found in MongoDB`);
        }
      }

      // Handle createdById reference
      if (data.createdById) {
        const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (user) {
          mongoData.createdById = user._id;
        } else {
          console.warn(`User with MySQL ID ${data.createdById} not found in MongoDB`);
        }
      }

      // Create in MongoDB
      const mongoResource = await ListMongo.create(mongoData);
      console.log("List saved in MongoDB:", mongoResource);

      // Log successful creation
      await Log.create({
        userId: data.createdById || null,
        action: 'CREATE_LIST_SUCCESS',
        details: `Created list with ID ${mysqlResource.id} (${data.name})`
      });

      return mysqlResource;
    } catch (error) {
      // Log creation error
      await Log.create({
        userId: data.createdById || null,
        action: 'CREATE_LIST_ERROR',
        details: `Error creating list: ${error.message}`
      });
      console.error("Error creating List:", error);
      throw new Error('Error creating List: ' + error.message);
    }
  }
  
 async update(id, data) {
  try {
    // Validate required fields
    if (!data.name) {
      throw new Error("List name is required");
    }

    // Ensure we have a user ID for logging
    const userId = data.updatedById || data.createdById;
    if (!userId) {
      throw new Error("User ID is required for logging");
    }


    // Update in MySQL
    const [updatedCount] = await List.update(
      { name: data.name },
      { where: { id } }
    );

    if (updatedCount === 0) {
      await Log.create({
        userId: userId,
        action: 'UPDATE_LIST_FAILED',
        details: `List with ID ${data.name} not found in MySQL`
      });
      throw new Error("List not found in MySQL");
    }

    // Prepare MongoDB update
    const mongoUpdateData = { 
      name: data.name,
      updatedAt: new Date()
    };

    // Update in MongoDB
    const updatedMongoDB = await ListMongo.updateOne(
      { mysqlId: id },
      { $set: mongoUpdateData }
    );

    // Log success
    await Log.create({
      userId: userId,
      action: 'UPDATE_LIST_SUCCESS',
      details: `Updated list with ID ${data.name}`
    });

    // Return the updated list with populated relationships
    return this.findById(id);
  } catch (error) {
    // Log error with available user ID
    await Log.create({
      userId: data.updatedById || data.createdById || 0,
      action: 'UPDATE_LIST_ERROR',
      details: `Error updating list ${id}: ${error.message}`
    });
    console.error("Error updating List:", error);
    throw error;
  }
}

async delete(id, userId) { // Add userId parameter to track who performed the deletion
  try {


      // Delete from MySQL
      const deletedMySQL = await List.destroy({ where: { id } });
      
      if (deletedMySQL === 0) {
          await Log.create({
              userId: userId || null,
              action: 'DELETE_LIST_FAILED',
              details: `List with ID ${id} not found in MySQL`
          });
          throw new Error("List not found in MySQL");
      }

      // Delete from MongoDB
      const deleteResult = await ListMongo.deleteOne({ mysqlId: id });
      
      if (deleteResult.deletedCount === 0) {
          console.warn("List not found in MongoDB");
      }

      await Log.create({
          userId: userId || null,
          action: 'DELETE_LIST_SUCCESS',
          details: `Successfully deleted list with ID ${id}`
      });

      return deletedMySQL;
  } catch (error) {
      await Log.create({
          userId: userId || null,
          action: 'DELETE_LIST_ERROR',
          details: `Error deleting list ${id}: ${error.message}`
      });
      console.error("Error deleting List:", error);
      throw error;
  }
}
}

module.exports = new ListRepository();
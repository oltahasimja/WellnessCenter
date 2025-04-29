
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Log = require('../database/models/MySQL/log');

const { Program, User } = require('../database/models/index');
const { ProgramMongo, UserMongo } = require('../database/models/indexMongo');


class ProgramRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await ProgramMongo.find().populate([{ path: 'createdById', model: 'UserMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Program.findAll({ include: [{ model: User }] });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await ProgramMongo.findOne({ mysqlId: id }).populate([{ path: 'createdById', model: 'UserMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Program.findByPk(id, { include: [{ model: User }] });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Program:", data);
  
      // First create in MySQL
      const mysqlResource = await Program.create(data);
      await Log.create({
        userId: data.createdById, // assuming createdById is the user who created this
        action: 'CREATE_PROGRAM',
        details: `Created program with ID ${mysqlResource.id}`
      });
  
      // Prepare data for MongoDB, remove _id to let MongoDB generate it automatically
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data,
        createdAt: new Date(), // Ensure createdAt is set for MongoDB as well
      };
  
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      if (data.createdById) {
        const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (!user) {
          throw new Error(`User with MySQL ID ${data.createdById} not found in MongoDB`);
        }
        mongoData.createdById = new ObjectId(user._id.toString()); // Ensure proper casting
      }
  
      // Create in MongoDB (let MongoDB generate the _id)
      const mongoResource = await ProgramMongo.create(mongoData);
      console.log("Program saved in MongoDB:", mongoResource);
  
      return mysqlResource;
    } catch (error) {
      await Log.create({
        userId: data.createdById || null,
        action: 'CREATE_PROGRAM_ERROR',
        details: `Error creating program: ${error.message}`
      });
      console.error("Error creating Program:", error);
      throw error;
      throw new Error('Error creating Program: ' + error.message);
    }
    
  }
  async update(id, data) {
    try {
      await Log.create({
        userId: data.updatedById || data.createdById || null, // whoever is performing the update
        action: 'UPDATE_PROGRAM_START',
        details: `Attempting to update program ${id}`
      });

      // Update in MySQL
      const [updatedCount] = await Program.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Program not found in MySQL");
      }
      await Log.create({
        userId: data.updatedById || data.createdById || null,
        action: 'UPDATE_PROGRAM_SUCCESS',
        details: `Updated program with ID ${id}`
      });
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.createdById) {
        // Find the related document in MongoDB
        const role = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (!role) {
          throw new Error(`Role with MySQL ID ${data.createdById} not found in MongoDB`);
        }
        mongoUpdateData.createdById = new ObjectId(role._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await ProgramMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("User not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      await Log.create({
        userId: data.updatedById || data.createdById || null,
        action: 'UPDATE_PROGRAM_ERROR',
        details: `Error updating program ${id}: ${error.message}`
      });
      console.error("Error updating User:", error);
      throw error;
      throw new Error('Error updating User: ' + error.message);
    }
  }
  
  
  async delete(id, userId) { // Add userId parameter to track who performed the deletion
    try {
        await Log.create({
            userId: userId || null,
            action: 'DELETE_PROGRAM_START',
            details: `Attempting to delete program ${id}`
        });

        // Delete from MySQL
        const deletedMySQL = await Program.destroy({ where: { id } });
        
        if (deletedMySQL === 0) {
            await Log.create({
                userId: userId || null,
                action: 'DELETE_PROGRAM_FAILED',
                details: `Program with ID ${id} not found in MySQL`
            });
            throw new Error("Program not found in MySQL");
        }

        // Delete from MongoDB
        const deleteResult = await ProgramMongo.deleteOne({ mysqlId: id });
        
        if (deleteResult.deletedCount === 0) {
            console.warn("Program not found in MongoDB");
        }

        await Log.create({
            userId: userId || null,
            action: 'DELETE_PROGRAM_SUCCESS',
            details: `Successfully deleted program with ID ${id}`
        });

        return deletedMySQL;
    } catch (error) {
        await Log.create({
            userId: userId || null,
            action: 'DELETE_PROGRAM_ERROR',
            details: `Error deleting program ${id}: ${error.message}`
        });
        console.error("Error deleting Program:", error);
        throw error;
    }
}
}

module.exports = new ProgramRepository();

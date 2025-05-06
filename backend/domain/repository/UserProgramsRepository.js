const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;


const { UserMongo, ProgramMongo, UserProgramsMongo } = require('../database/models/indexMongo');

const { User, Program, UserPrograms } = require('../database/models/index');


class UserProgramsRepository {
  async findAll() {
    try {
      return await UserProgramsMongo.find()
        .populate([{ path: 'userId', model: 'UserMongo' }, { path: 'programId', model: 'ProgramMongo' }])
        .lean();
    } catch (error) {
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
    }
  }

  async findById(id) {
    try {
      return await UserProgramsMongo.findOne({ mysqlId: id })
        .populate([{ path: 'userId', model: 'UserMongo' }, { path: 'programId', model: 'ProgramMongo' }])
        .lean();
    } catch (error) {
      console.error("MongoDB findById failed, falling back to MySQL:", error);
    }
  }

 

  async create(data) {
    try {
      console.log("Received data for creation:", data);
      
      // Validate input data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }
  
      // Validate required fields with more detailed checks
      if (!data.userId || !data.programId) {
        throw new Error('Both userId and programId are required');
      }
  
      // Safely convert to strings
      const userIdStr = String(data.userId || '');
      const programIdStr = String(data.programId || '');
  
      if (!userIdStr || !programIdStr) {
        throw new Error('Invalid userId or programId format');
      }
  
      // Check if the relationship already exists
      const existing = await UserPrograms.findOne({
        where: {
          userId: userIdStr,
          programId: programIdStr
        }
      });
  
      if (existing) {
        throw new Error('This user-program relationship already exists');
      }
  
      // Get the program to set invitedById
      const program = await Program.findByPk(programIdStr);
      if (!program) {
        throw new Error(`Program with ID ${programIdStr} not found`);
      }
  
      // Create in MySQL
      const mysqlResource = await UserPrograms.create({
        userId: userIdStr,
        programId: programIdStr,
        invitedById: program.createdById || null
      });
  
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: String(mysqlResource.id),
        createdAt: new Date(),
        invitedById: program.createdById || null
      };
  
      // Find and validate user in MongoDB
      const user = await UserMongo.findOne({ mysqlId: userIdStr });
      if (!user) {
        throw new Error(`User with ID ${userIdStr} not found in MongoDB`);
      }
      mongoData.userId = user._id;
  
      // Find and validate program in MongoDB
      const programMongo = await ProgramMongo.findOne({ mysqlId: programIdStr });
      if (!programMongo) {
        throw new Error(`Program with ID ${programIdStr} not found in MongoDB`);
      }
      mongoData.programId = programMongo._id;
  
      // Create in MongoDB
      const mongoResource = await UserProgramsMongo.create(mongoData);
      console.log("Successfully created in MongoDB:", mongoResource);
  
      return mysqlResource;
    } catch (error) {
      console.error("Detailed creation error:", {
        message: error.message,
        stack: error.stack,
        inputData: data
      });
      throw new Error(`Failed to create user-program relationship: ${error.message}`);
    }
  }


  async update(id, data) {
    try {
      const [updatedCount] = await UserPrograms.update(
        { ...data },
        { where: { id } }
      );
      if (updatedCount === 0) {
        throw new Error("UserPrograms not found in MySQL");
      }

      const mongoUpdateData = { ...data };

      if (data.userId) {
        const user = await UserMongo.findOne({ mysqlId: data.userId.toString() });
        if (!user) throw new Error(`User with MySQL ID ${data.userId} not found in MongoDB`);
        mongoUpdateData.userId = new ObjectId(user._id.toString());
      }

      if (data.programId) {
        const program = await ProgramMongo.findOne({ mysqlId: data.programId.toString() });
        if (!program) throw new Error(`Program with MySQL ID ${data.programId} not found in MongoDB`);
        mongoUpdateData.programId = new ObjectId(program._id.toString());
      }

      const updatedMongoDB = await UserProgramsMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );

      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("UserPrograms not found in MongoDB or no changes made");
      }

      return this.findById(id);
    } catch (error) {
      console.error("Error updating UserPrograms:", error);
      throw new Error('Error updating UserPrograms: ' + error.message);
    }
  }

  async delete(id) {
    try {
      const deletedMySQL = await UserPrograms.destroy({ where: { id } });
      await UserProgramsMongo.deleteOne({ mysqlId: id });
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting UserPrograms:", error);
      throw new Error('Error deleting UserPrograms: ' + error.message);
    }
  }
}

module.exports = new UserProgramsRepository();

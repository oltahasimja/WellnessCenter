const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const UserPrograms = require("../database/models/UserPrograms");
const UserProgramsMongo = require("../database/models/UserProgramsMongo");
const User = require("../database/models/User");
const UserMongo = require("../database/models/UserMongo");
const Program = require("../database/models/Program");
const ProgramMongo = require("../database/models/ProgramMongo");

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
      console.log("Creating UserPrograms:", data);

      const program = await Program.findByPk(data.programId);
      if (!program || !program.createdById) {
        throw new Error(`Program with ID ${data.programId} not found or missing createdById`);
      }

      data.invitedById = program.createdById;

      const mysqlResource = await UserPrograms.create(data);

      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        createdAt: new Date(),
      };

      if (data.userId) {
        const user = await UserMongo.findOne({ mysqlId: data.userId.toString() });
        if (!user) throw new Error(`User with MySQL ID ${data.userId} not found in MongoDB`);
        mongoData.userId = new ObjectId(user._id.toString());
      }

      if (data.programId) {
        const programMongo = await ProgramMongo.findOne({ mysqlId: data.programId.toString() });
        if (!programMongo) throw new Error(`Program with MySQL ID ${data.programId} not found in MongoDB`);
        mongoData.programId = new ObjectId(programMongo._id.toString());
      }

      if (data.invitedById) {
        const invitedByUser = await UserMongo.findOne({ mysqlId: data.invitedById.toString() });
        if (!invitedByUser) throw new Error(`User with MySQL ID ${data.invitedById} not found in MongoDB`);
        mongoData.invitedById = new ObjectId(invitedByUser._id.toString());
      }

      const mongoResource = await UserProgramsMongo.create(mongoData);
      console.log("UserPrograms saved in MongoDB:", mongoResource);

      return mysqlResource;
    } catch (error) {
      console.error("Error creating UserPrograms:", error);
      throw new Error('Error creating UserPrograms: ' + error.message);
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

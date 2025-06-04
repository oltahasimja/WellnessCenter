const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Log = require('../database/models/MySQL/log');
const { List, User } = require('../database/models/index');
const { ListMongo, UserMongo, ProgramMongo } = require('../database/models/indexMongo');

class ListRepository {
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

  async create(data) {
    try {
      console.log("Creating List:", data);

      const mysqlResource = await List.create(data);

      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        name: data.name,
        createdAt: new Date(),
      };

      if (data.programId) {
        const program = await ProgramMongo.findOne({ mysqlId: data.programId.toString() });
        if (program) mongoData.programId = program._id;
      }

      if (data.createdById) {
        const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (user) mongoData.createdById = user._id;
      }

      await ListMongo.create(mongoData);

      const user = data.createdById ? await User.findByPk(data.createdById) : null;

      const logData = {
        userId: data.createdById || null,
        action: 'CREATE_LIST_SUCCESS',
        details: `User ${user?.username || 'Unknown'} created list with ID ${mysqlResource.id} (${data.name})`,
        programId: data.programId || null,
      };

      await Log.create(logData);
      return mysqlResource;
    } catch (error) {
      const user = data.createdById ? await User.findByPk(data.createdById).catch(() => null) : null;

      const errorLogData = {
        userId: data.createdById || null,
        action: 'CREATE_LIST_ERROR',
        details: `User ${user?.username || 'Unknown'} failed to create list: ${error.message}`,
        programId: data.programId || null,
      };

      await Log.create(errorLogData);
      console.error("Error creating List:", error);
      throw new Error('Error creating List: ' + error.message);
    }
  }

  async update(id, data) {
    try {
      if (!data.name) throw new Error("List name is required");

      const userId = data.updatedById || data.createdById;
      if (!userId) throw new Error("User ID is required for logging");

      const user = await User.findByPk(userId);
      const existingList = await List.findByPk(id);
      if (!existingList) throw new Error("List not found");

      const [updatedCount] = await List.update(
        { name: data.name },
        { where: { id } }
      );

      if (updatedCount === 0) {
        const failLogData = {
          userId,
          action: 'UPDATE_LIST_FAILED',
          details: `User ${user?.username || 'Unknown'} failed to update: list with ID ${id} not found in MySQL`,
          programId: existingList.programId || null
        };
        await Log.create(failLogData);
        throw new Error("List not found in MySQL");
      }

      await ListMongo.updateOne(
        { mysqlId: id },
        { $set: { name: data.name, updatedAt: new Date() } }
      );

      const successLogData = {
        userId,
        action: 'UPDATE_LIST_SUCCESS',
        details: `User ${user?.username || 'Unknown'} updated list ID ${id} with name "${data.name}"`,
        programId: existingList.programId || null
      };
      await Log.create(successLogData);

      return this.findById(id);
    } catch (error) {
      const user = (data.updatedById || data.createdById) ? await User.findByPk(data.updatedById || data.createdById).catch(() => null) : null;
      const existingList = await List.findByPk(id).catch(() => null);

      const errorLogData = {
        userId: data.updatedById || data.createdById || null,
        action: 'UPDATE_LIST_ERROR',
        details: `User ${user?.username || 'Unknown'} encountered error updating list ${id}: ${error.message}`,
        programId: existingList?.programId || null
      };

      await Log.create(errorLogData);
      console.error("Error updating List:", error);
      throw error;
    }
  }
 async delete(id, userId) {
    try {
      const user = userId ? await User.findByPk(userId) : null;
      const existingList = await List.findByPk(id);
      if (!existingList) {
        const failLogData = {
          userId: userId || null,
          action: 'DELETE_LIST_FAILED',
          details: `User ${user?.username || 'Unknown'} attempted to delete non-existing list with ID ${id}`,
          programId: null
        };
        await Log.create(failLogData);
        throw new Error("List not found in MySQL");
      }

      const deletedMySQL = await List.destroy({ where: { id } });
      const deleteResult = await ListMongo.deleteOne({ mysqlId: id });

      if (deleteResult.deletedCount === 0) {
        console.warn("List not found in MongoDB");
      }

      const successLogData = {
        userId: userId || null,
        action: 'DELETE_LIST_SUCCESS',
        details: `User ${user?.username || 'Unknown'} successfully deleted list with ID ${id}`,
        programId: existingList.programId || null
      };
      await Log.create(successLogData);

      return deletedMySQL;
    } catch (error) {
      const user = userId ? await User.findByPk(userId).catch(() => null) : null;
      const existingList = await List.findByPk(id).catch(() => null);

      const errorLogData = {
        userId: userId || null,
        action: 'DELETE_LIST_ERROR',
        details: `User ${user?.username || 'Unknown'} failed to delete list ${id}: ${error.message}`,
        programId: existingList?.programId || null
      };

      await Log.create(errorLogData);
      console.error("Error deleting List:", error);
      throw error;
    }
  }
}

module.exports = new ListRepository();
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;



const { ScheduleMongo, UserMongo } = require('../database/models/indexMongo');
const { Schedule, User } = require('../database/models/index');



class ScheduleRepository {
  async findAll(filter = {}) {
    try {
      const query = {};
      
      if (filter.specialistId) {
        if (mongoose.isValidObjectId(filter.specialistId)) {
          query.specialistId = filter.specialistId;
        } else {
          const specialist = await UserMongo.findOne({ 
            mysqlId: filter.specialistId.toString() 
          });
          if (!specialist) throw new Error('Specialist not found');
          query.specialistId = specialist._id;
        }
      }
  
      const schedules = await ScheduleMongo.find(query)
        .populate({
          path: 'specialistId',
          select: 'name lastName profileImageId mysqlId',
          model: 'UserMongo',
          populate: { 
            path: 'roleId', 
            model: 'RoleMongo',
            select: 'name' 
          }
        })
        .lean();
  
      return schedules.map(schedule => ({
        ...schedule,
        id: schedule.mysqlId,
        specialistName: schedule.specialistId 
          ? `${schedule.specialistId.name} ${schedule.specialistId.lastName}`
          : 'Unknown Specialist',
        specialistRole: schedule.specialistId?.roleId?.name || 'No Role' // Shto rolin e specialistit
      }));
    } catch (error) {
      console.error("Error finding schedules:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const schedule = await ScheduleMongo.findOne({ mysqlId: id })
        .populate({
          path: 'specialistId',
          select: 'name lastName mysqlId',
          model: 'UserMongo'
        })
        .lean();

      if (!schedule) return null;

      return {
        ...schedule,
        id: schedule.mysqlId, // Ensure id field is present
        specialistName: schedule.specialistId 
          ? `${schedule.specialistId.name} ${schedule.specialistId.lastName}`
          : 'Unknown Specialist'
      };
    } catch (error) {
      console.error("MongoDB findById failed:", error);
      throw error;
    }
  }
  
  async create(data) {
    try {
      const specialist = await UserMongo.findById(data.specialistId);
      if (!specialist) {
        throw new Error(`Specialist with ID ${data.specialistId} not found`);
      }
      
      if (!specialist.mysqlId) {
        throw new Error(`Specialist doesn't have a corresponding MySQL ID`);
      }
  
      // Create in MySQL first
      const mysqlData = {
        ...data,
        specialistId: parseInt(specialist.mysqlId, 10)
      };
      const mysqlResource = await Schedule.create(mysqlData);
      
      // Then create in MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data,
        specialistId: specialist._id
      };
      const mongoResource = await ScheduleMongo.create(mongoData);
      
      // Return populated data immediately
      const populatedSchedule = await ScheduleMongo.findById(mongoResource._id)
        .populate({
          path: 'specialistId',
          select: 'name lastName mysqlId',
          model: 'UserMongo'
        })
        .lean();
  
      return {
        ...populatedSchedule,
        id: populatedSchedule.mysqlId,
        specialistName: populatedSchedule.specialistId 
          ? `${populatedSchedule.specialistId.name} ${populatedSchedule.specialistId.lastName}`
          : 'Unknown Specialist'
      };
    } catch (error) {
      console.error("Error creating Schedule:", error);
      throw error;
    }
  }
  
  async update(id, data) {
    try {
      // First find the specialist in MongoDB to get the mysqlId
      let specialistMysqlId = null;
      if (data.specialistId) {
        const specialist = await UserMongo.findById(data.specialistId);
        if (!specialist) {
          throw new Error(`Specialist with ID ${data.specialistId} not found`);
        }
        if (!specialist.mysqlId) {
          throw new Error(`Specialist doesn't have a corresponding MySQL ID`);
        }
        specialistMysqlId = parseInt(specialist.mysqlId, 10);
      }
  
      // Process workDays to ensure it's a unique array
      let workDaysArray = [];
      if (typeof data.workDays === 'string') {
        workDaysArray = [...new Set(data.workDays.split(',').map(day => day.trim()))];
      } else if (Array.isArray(data.workDays)) {
        workDaysArray = [...new Set(data.workDays)];
      }
  
      // Prepare data for MySQL update
      const mysqlUpdateData = {
        ...data,
        specialistId: specialistMysqlId,
        workDays: workDaysArray
      };
  
      // Update MySQL
      const [updatedCount] = await Schedule.update(
        mysqlUpdateData,
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Schedule not found in MySQL");
      }
      
      // Prepare data for MongoDB update
      const mongoUpdateData = { 
        ...data,
        workDays: workDaysArray
      };
      
      if (data.specialistId) {
        mongoUpdateData.specialistId = new ObjectId(data.specialistId);
      }
      
      await ScheduleMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      // Return populated updated schedule
      const updatedSchedule = await ScheduleMongo.findOne({ mysqlId: id })
        .populate({
          path: 'specialistId',
          select: 'name lastName mysqlId',
          model: 'UserMongo'
        })
        .lean();
      
      if (!updatedSchedule) {
        throw new Error("Schedule not found after update");
      }
      
      return {
        ...updatedSchedule,
        id: updatedSchedule.mysqlId,
        specialistName: updatedSchedule.specialistId 
          ? `${updatedSchedule.specialistId.name} ${updatedSchedule.specialistId.lastName}`
          : 'Unknown Specialist',
        workDays: updatedSchedule.workDays
      };
    } catch (error) {
      console.error("Error updating Schedule:", error);
      throw new Error('Error updating Schedule: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Schedule.destroy({ where: { id } });
      
      // Delete from MongoDB
      await ScheduleMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Schedule:", error);
      throw new Error('Error deleting Schedule: ' + error.message);
    }
  }
}

module.exports = new ScheduleRepository();
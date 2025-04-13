
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const ScheduleTraining = require("../database/models/ScheduleTraining");
const ScheduleTrainingMongo = require("../database/models/ScheduleTrainingMongo");
const Training = require("../database/models/Training");
const TrainingMongo = require("../database/models/TrainingMongo");

class ScheduleTrainingRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await ScheduleTrainingMongo.find().populate([{ path: 'trainingId', model: 'TrainingMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await ScheduleTraining.findAll({ include: [{ model: Training }] });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await ScheduleTrainingMongo.findOne({ mysqlId: id }).populate([{ path: 'trainingId', model: 'TrainingMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await ScheduleTraining.findByPk(id, { include: [{ model: Training }] });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating ScheduleTraining:", data);
      
      // First create in MySQL
      const mysqlResource = await ScheduleTraining.create(data);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data
      };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.trainingId) {
        // Find the related document in MongoDB
        const training = await TrainingMongo.findOne({ mysqlId: data.trainingId.toString() });
        if (!training) {
          throw new Error(`Training with MySQL ID ${data.trainingId} not found in MongoDB`);
        }
        mongoData.trainingId = new ObjectId(training._id.toString());
      }
      
      // Create in MongoDB
      const mongoResource = await ScheduleTrainingMongo.create(mongoData);
      console.log("ScheduleTraining saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating ScheduleTraining:", error);
      throw new Error('Error creating ScheduleTraining: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Kontrollo nëse trainingId ekziston në MySQL
      if (data.trainingId) {
        const trainingExists = await Training.findOne({ where: { id: data.trainingId } });
        if (!trainingExists) {
          throw new Error(`Training with ID ${data.trainingId} not found`);
        }
      }
  
      // Update in MySQL
      const [updatedCount] = await ScheduleTraining.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("ScheduleTraining not found in MySQL");
      }
      
      // Përgatit të dhënat për MongoDB
      const mongoUpdateData = { ...data };
      
      // Konverto trainingId për MongoDB
      if (data.trainingId) {
        const training = await TrainingMongo.findOne({ mysqlId: data.trainingId.toString() });
        if (!training) {
          throw new Error(`Training with MySQL ID ${data.trainingId} not found in MongoDB`);
        }
        mongoUpdateData.trainingId = new ObjectId(training._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await ScheduleTrainingMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("ScheduleTraining not found in MongoDB or no changes made");
      }
  
      return this.findById(id);
    } catch (error) {
      console.error("Error updating ScheduleTraining:", error);
      throw new Error('Error updating ScheduleTraining: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await ScheduleTraining.destroy({ where: { id } });
      
      // Delete from MongoDB
      await ScheduleTrainingMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting ScheduleTraining:", error);
      throw new Error('Error deleting ScheduleTraining: ' + error.message);
    }
  }
}

module.exports = new ScheduleTrainingRepository();

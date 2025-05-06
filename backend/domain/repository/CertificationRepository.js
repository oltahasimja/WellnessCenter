
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;


const { Certification, User, Training } = require('../database/models/index');
const { CertificationMongo, UserMongo, TrainingMongo } = require('../database/models/indexMongo');


class CertificationRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await CertificationMongo.find().populate([{ path: 'userId', model: 'UserMongo' }, { path: 'trainingId', model: 'TrainingMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Certification.findAll({ include: [{ model: User }, { model: Training }] });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await CertificationMongo.findOne({ mysqlId: id }).populate([{ path: 'userId', model: 'UserMongo' }, { path: 'trainingId', model: 'TrainingMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Certification.findByPk(id, { include: [{ model: User }, { model: Training }] });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Certification:", data);
      
      // First create in MySQL
      const mysqlResource = await Certification.create(data);
      
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        ...data
      };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      if (data.userId) {
        // Find the related document in MongoDB
        const user = await UserMongo.findOne({ mysqlId: data.userId.toString() });
        if (!user) {
          throw new Error(`User with MySQL ID ${data.userId} not found in MongoDB`);
        }
        mongoData.userId = new ObjectId(user._id.toString());
      }

      if (data.trainingId) {
        // Find the related document in MongoDB
        const training = await TrainingMongo.findOne({ mysqlId: data.trainingId.toString() });
        if (!training) {
          throw new Error(`Training with MySQL ID ${data.trainingId} not found in MongoDB`);
        }
        mongoData.trainingId = new ObjectId(training._id.toString());
      }
      
      // Create in MongoDB
      const mongoResource = await CertificationMongo.create(mongoData);
      console.log("Certification saved in MongoDB:", mongoResource);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Certification:", error);
      throw new Error('Error creating Certification: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Certification.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Certification not found in MySQL");
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

      if (data.trainingId) {
        // Find the related document in MongoDB
        const training = await TrainingMongo.findOne({ mysqlId: data.trainingId.toString() });
        if (!training) {
          throw new Error(`Training with MySQL ID ${data.trainingId} not found in MongoDB`);
        }
        mongoUpdateData.trainingId = new ObjectId(training._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await CertificationMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Certification not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Certification:", error);
      throw new Error('Error updating Certification: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Certification.destroy({ where: { id } });
      
      // Delete from MongoDB
      await CertificationMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Certification:", error);
      throw new Error('Error deleting Certification: ' + error.message);
    }
  }
}

module.exports = new CertificationRepository();

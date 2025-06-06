const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const { TrainingMongo, UserMongo } = require('../database/models/indexMongo');

const { Training } = require('../database/models/index');


class TrainingRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      const trainings = await TrainingMongo.find()
        .populate({
          path: 'createdById',
          select: 'name lastName email',
          model: 'UserMongo' // Specifikoni modelin eksplicitisht
        })
        .lean();
  
      return trainings.map(training => ({
        ...training,
        creatorDisplayName: training.createdById 
          ? `${training.createdById.name} ${training.createdById.lastName || ''}`.trim()
          : 'Unknown'
      }));
    } catch (error) {
      console.error("Error fetching trainings:", error);
      throw error;
    }
  }
  
  async findById(id) {
  try {
    const training = await TrainingMongo.findOne({ mysqlId: id })
      .populate({
        path: 'createdById',
        select: 'name lastName email mysqlId',
        model: 'UserMongo'
      })
      .lean();

    if (!training) return null;

    return {
      ...training,
      creatorDisplayName: training.createdById
        ? `${training.createdById.name} ${training.createdById.lastName || ''}`.trim()
        : 'Unknown'
    };
  } catch (error) {
    console.error("MongoDB findById failed, falling back to MySQL:", error);
  }
}

  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      // 1. First create in MySQL
      const mysqlResource = await Training.create({
        title: data.title,
        category: data.category,
        description: data.description,
        duration: data.duration,
        max_participants: data.max_participants,
        createdById: data.createdById
      });
  
      // 2. Find user in MongoDB by mysqlId (string comparison)
      const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
      
      if (!user) {
        throw new Error(`User with mysqlId ${data.createdById} not found in MongoDB`);
      }
  
      // 3. Create in MongoDB using the user's _id (ObjectId)
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        title: data.title,
        category: data.category,
        description: data.description,
        duration: data.duration,
        max_participants: data.max_participants,
        createdById: user._id // Correct: using MongoDB ObjectId
      };
  
      await TrainingMongo.create(mongoData);
      
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Training:", error);
      throw error;
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Training.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Training not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { ...data };
      
      // Handle foreign keys - convert MySQL IDs to MongoDB references
      
      
      // Update in MongoDB
      const updatedMongoDB = await TrainingMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Training not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Training:", error);
      throw new Error('Error updating Training: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Training.destroy({ where: { id } });
      
      // Delete from MongoDB
      await TrainingMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Training:", error);
      throw new Error('Error deleting Training: ' + error.message);
    }
  }
}

module.exports = new TrainingRepository();
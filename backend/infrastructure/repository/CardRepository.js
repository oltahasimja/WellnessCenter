
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Card = require("../database/models/Card");
const CardMongo = require("../database/models/CardMongo");
const User = require("../database/models/User");
const UserMongo = require("../database/models/UserMongo");
const List = require("../database/models/List");
const ListMongo = require("../database/models/ListMongo");

class CardRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      // Get all from MongoDB with populated relationships
      return await CardMongo.find().populate([{ path: 'createdById', model: 'UserMongo' }, { path: 'listId', model: 'ListMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
      // return await Card.findAll({ include: [{ model: User }, { model: List }] });
    }
  }
  
  async findById(id) {
    try {
      // Get from MongoDB with populated relationships
      return await CardMongo.findOne({ mysqlId: id }).populate([{ path: 'createdById', model: 'UserMongo' }, { path: 'listId', model: 'ListMongo' }]).lean();
    } catch (error) {
      // Fallback to MySQL if MongoDB fails
      console.error("MongoDB findById failed, falling back to MySQL:", error);
      // return await Card.findByPk(id, { include: [{ model: User }, { model: List }] });
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Card:", data);
  
      // First create in MySQL
      const mysqlResource = await Card.create(data);
  
      // Prepare data for MongoDB, remove _id to let MongoDB generate it automatically
      const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        title: data.title || data.name, // Map to correct field name
        description: data.description || "",
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        labels: Array.isArray(data.labels) ? data.labels : [],
        checklist: Array.isArray(data.checklist) ? data.checklist : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Only convert programId to ObjectId if it's a valid MongoDB ID
      // If it's a MySQL ID, we should look up the corresponding MongoDB document
      if (data.listId) {
        // Find the program in MongoDB that has this mysqlId
        const list = await ListMongo.findOne({ mysqlId: data.listId.toString() });
        if (list) {
          mongoData.listId = list._id;
        } else {
          console.warn(`Program with MySQL ID ${data.listId} not found in MongoDB`);
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
      const mongoResource = await CardMongo.create(mongoData);
      console.log("Card saved in MongoDB:", mongoResource);
  
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Card:", error);
      throw new Error('Error creating Card: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // Update in MySQL
      const [updatedCount] = await Card.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("Card not found in MySQL");
      }
      
      // Prepare update data for MongoDB
      const mongoUpdateData = { 
        name: data.name, // Only include fields that need updating
        updatedAt: new Date() // Add updated timestamp
      };
      
      // Handle programId - find corresponding MongoDB document
      if (data.listId) {
        const list = await ListMongo.findOne({ mysqlId: data.listId.toString() });
        if (!List) {
          console.warn(`List with MySQL ID ${data.listId} not found in MongoDB`);
        } else {
          mongoUpdateData.listId = list._id;
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
      const updatedMongoDB = await CardMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("Card not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating Card:", error);
      throw new Error('Error updating Card: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await Card.destroy({ where: { id } });
      
      // Delete from MongoDB
      await CardMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Card:", error);
      throw new Error('Error deleting Card: ' + error.message);
    }
  }
}

module.exports = new CardRepository();

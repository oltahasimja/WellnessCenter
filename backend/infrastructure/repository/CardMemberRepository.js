
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const CardMember = require("../database/models/CardMember");
const CardMemberMongo = require("../database/models/CardMemberMongo");
const User = require("../database/models/User");
const UserMongo = require("../database/models/UserMongo");
const Card = require("../database/models/Card");
const CardMongo = require("../database/models/CardMongo");

class CardMemberRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      return await CardMemberMongo.find()
        .populate([{ path: 'userId', model: 'UserMongo' }, { path: 'cardId', model: 'CardMongo' }])
        .lean();
    } catch (error) {
      console.error("MongoDB findAll failed, falling back to MySQL:", error);
    }
  }
  
  async findById(id) {
    try {
      return await CardMemberMongo.findOne({ mysqlId: id })
        .populate([{ path: 'userId', model: 'UserMongo' }, { path: 'cardId', model: 'CardMongo' }])
        .lean();
    } catch (error) {
      console.error("MongoDB findById failed, falling back to MySQL:", error);
    }
  }

  
  // Write operations - Write to both MongoDB and MySQL
  
  async create(data) {
    try {
      console.log("Received data for creation:", data);
      
      // Validate input data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }
  
      // Validate required fields with more detailed checks
      if (!data.userId || !data.cardId) {
        throw new Error('Both userId and programId are required');
      }
  
      // Safely convert to strings
      const userIdStr = String(data.userId || '');
      const cardIdStr = String(data.cardId || '');
  
      if (!userIdStr || !cardIdStr) {
        throw new Error('Invalid userId or programId format');
      }
  
      // Check if the relationship already exists
      const existing = await CardMember.findOne({
        where: {
          userId: userIdStr,
          cardId: cardIdStr
        }
      });
  
      if (existing) {
        throw new Error('This card member relationship already exists');
      }
  
      // Get the program to set invitedById
      const card = await Card.findByPk(cardIdStr);
      if (!card) {
        throw new Error(`Card with ID ${cardIdStr} not found`);
      }
  
      // Create in MySQL
      const mysqlResource = await CardMember.create({
        userId: userIdStr,
        cardId: cardIdStr,
        invitedById: card.createdById || null
      });
  
      // Prepare data for MongoDB
      const mongoData = {
        mysqlId: String(mysqlResource.id),
        createdAt: new Date(),
        invitedById: card.createdById || null
      };
  
      // Find and validate user in MongoDB
      const user = await UserMongo.findOne({ mysqlId: userIdStr });
      if (!user) {
        throw new Error(`User with ID ${userIdStr} not found in MongoDB`);
      }
      mongoData.userId = user._id;
  
      // Find and validate program in MongoDB
      const cardMongo = await CardMongo.findOne({ mysqlId: cardIdStr });
      if (!cardMongo) {
        throw new Error(`card with ID ${cardIdStr} not found in MongoDB`);
      }
      mongoData.cardId = cardMongo._id;
  
      // Create in MongoDB
      const mongoResource = await CardMemberMongo.create(mongoData);
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
      // Update in MySQL
      const [updatedCount] = await CardMember.update(
        { ...data },
        { where: { id } }
      );
  
      if (updatedCount === 0) {
        throw new Error("CardMember not found in MySQL");
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

      if (data.cardId) {
        // Find the related document in MongoDB
        const card = await CardMongo.findOne({ mysqlId: data.cardId.toString() });
        if (!card) {
          throw new Error(`Card with MySQL ID ${data.cardId} not found in MongoDB`);
        }
        mongoUpdateData.cardId = new ObjectId(card._id.toString());
      }
      
      // Update in MongoDB
      const updatedMongoDB = await CardMemberMongo.updateOne(
        { mysqlId: id },
        { $set: mongoUpdateData }
      );
  
      if (updatedMongoDB.modifiedCount === 0) {
        console.warn("CardMember not found in MongoDB or no changes made");
      }
  
      // Return the updated resource with populated relationships
      return this.findById(id);
    } catch (error) {
      console.error("Error updating CardMember:", error);
      throw new Error('Error updating CardMember: ' + error.message);
    }
  }
  
  async delete(id) {
    try {
      // Delete from MySQL
      const deletedMySQL = await CardMember.destroy({ where: { id } });
      
      // Delete from MongoDB
      await CardMemberMongo.deleteOne({ mysqlId: id });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting CardMember:", error);
      throw new Error('Error deleting CardMember: ' + error.message);
    }
  }
}

module.exports = new CardMemberRepository();

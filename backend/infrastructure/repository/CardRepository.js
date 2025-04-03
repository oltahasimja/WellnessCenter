
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Card = require("../database/models/Card");
const CardMongo = require("../database/models/CardMongo");
const User = require("../database/models/User");
const UserMongo = require("../database/models/UserMongo");
const List = require("../database/models/List");
const ListMongo = require("../database/models/ListMongo");
const AttachmentMongo = require("../database/models/AttachmentMongo"); // Assuming you have an Attachment model for MongoDB

class CardRepository {
  // Read operations - Get from MongoDB with fallback to MySQL
  async findAll() {
    try {
      return await CardMongo.find()
        .populate([
          { path: 'createdById', model: 'UserMongo' },
          { path: 'listId', model: 'ListMongo' },
          { 
            path: 'attachments', 
            model: 'AttachmentMongo',
            select: 'name type size data' // Explicitly select the fields you need
          }
        ])
        .lean();
    } catch (error) {
      console.error("MongoDB findAll failed:", error);
      throw error;
    }
  }
  
  async findById(id) {
    try {
      // First fetch the card with basic information
      const card = await CardMongo.findOne({ mysqlId: id })
        .populate([
          { path: 'createdById', model: 'UserMongo' },
          { path: 'listId', model: 'ListMongo' }
        ])
        .lean();
      
      if (!card) {
        console.warn(`Card with ID ${id} not found in MongoDB`);
        return null;
      }
      
      // Now specifically fetch the attachments
      // Note: I'm using 'Attachment' model name here - adjust if your model name is different
      const attachments = await mongoose.model('Attachment').find(
        { cardId: card._id },
        'name type size data' // Explicitly select needed fields
      ).lean();
      
      console.log(`Found ${attachments.length} attachments for card ${id}`);
      
      // Replace the attachments array in the card
      card.attachments = attachments;
      
      return card;
    } catch (error) {
      console.error("MongoDB findById failed:", error);
      throw error;
    }
  }
  
  // Write operations - Write to both MongoDB and MySQL
  async create(data) {
    try {
      console.log("Creating Card:", data);
  
      // First create in MySQL
      const mysqlResource = await Card.create(data);


      const savedAttachments = await Promise.all(
        data.attachments.map(async attachment => {
          const newAttachment = new AttachmentMongo({
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            data: attachment.data,
            cardId: new mongoose.Types.ObjectId() // temporary
          });
          return await newAttachment.save();
        })
      );
  
      // Prepare data for MongoDB, remove _id to let MongoDB generate it automatically
       const mongoData = {
        mysqlId: mysqlResource.id.toString(),
        title: data.title || data.name,
        description: data.description || "",
        attachments: savedAttachments.map(att => att._id), // Only store reference IDs
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

      await AttachmentMongo.updateMany(
        { _id: { $in: savedAttachments.map(att => att._id) } },
        { cardId: mongoResource._id }
      );
  
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
        ...data, // Spread all data first
        updatedAt: new Date()
      };
      
      // Handle listId - find corresponding MongoDB document
      if (data.listId) {
        const list = await ListMongo.findOne({ mysqlId: data.listId.toString() });
        if (!list) {
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
      
      // Remove mysqlId from update data to avoid overwriting
      delete mongoUpdateData.mysqlId;
      
      // Update in MongoDB
      const updatedMongoDB = await CardMongo.findOneAndUpdate(
        { mysqlId: id },
        { $set: mongoUpdateData },
        { new: true } // Return the updated document
      ).populate([{ path: 'createdById', model: 'UserMongo' }, { path: 'listId', model: 'ListMongo' }]);
  
      if (!updatedMongoDB) {
        console.warn("Card not found in MongoDB");
      }
  
      return updatedMongoDB ? updatedMongoDB.toObject() : null;
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


const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const Log = require('../database/models/MySQL/log');
const { Card, User, List } = require('../database/models/index');
const { CardMongo, UserMongo, ListMongo, AttachmentMongo } = require('../database/models/indexMongo');



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
  
      const mysqlResource = await Card.create(data);
  
      // Handle attachments - initialize as empty array if not provided
      const attachmentsToProcess = data.attachments || [];
      const savedAttachments = await Promise.all(
        attachmentsToProcess.map(async attachment => {
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
      if (data.listId) {
        const list = await ListMongo.findOne({ mysqlId: data.listId.toString() });
        if (list) {
          mongoData.listId = list._id;
        } else {
          console.warn(`Program with MySQL ID ${data.listId} not found in MongoDB`);
        }
      }
  
      // Handle createdById similarly
      if (data.createdById) {
        const user = await UserMongo.findOne({ mysqlId: data.createdById.toString() });
        if (user) {
          mongoData.createdById = user._id;
        } else {
          console.warn(`User with MySQL ID ${data.createdById} not found in MongoDB`);
        }
      }
  
      // Create in MongoDB
      const mongoResource = await CardMongo.create(mongoData);
      console.log("Card saved in MongoDB:", mongoResource);
  
      await AttachmentMongo.updateMany(
        { _id: { $in: savedAttachments.map(att => att._id) } },
        { cardId: mongoResource._id }
      );
      await Log.create({
        userId: data.createdById || null,
        action: 'CREATE_CARD_SUCCESS',
        details: `Created card with ID ${mysqlResource.id} (${data.title})`
      });
      return mysqlResource;
    } catch (error) {
      await Log.create({
        userId: data.createdById || null,
        action: 'CREATE_CARD_ERROR',
        details: `Error creating card: ${error.message}`
      });
      console.error("Error creating Card:", error);
      throw new Error('Error creating Card: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
      // First, validate the card exists in MySQL
      const mysqlCard = await Card.findOne({ where: { id } });
      if (!mysqlCard) {
        throw new Error("Card not found in MySQL");
      }
  
      // Ensure we have a userId for logging, either from data or from the card itself
      const userId = mysqlCard.createdById;
      
      // Log update start
      if (userId) {
        await Log.create({
          userId: userId,
          action: 'UPDATE_CARD_START',
          details: `Attempting to update card ${id}`
        });
      } else {
        // Still log the action but without a user ID
        await Log.create({
          action: 'UPDATE_CARD_START',
          details: `Attempting to update card ${id} (no user ID provided)`
        });
      }
  
      // Prepare the MySQL update data
      const mysqlUpdateData = {
        title: data.title || mysqlCard.title,
        description: data.description || mysqlCard.description || "",
        dueDate: data.dueDate || mysqlCard.dueDate,
        priority: data.priority || mysqlCard.priority || "medium",
        labels: JSON.stringify(data.labels || []),
        checklist: JSON.stringify(data.checklist || []),
        updatedAt: new Date()
      };
  
      // Handle listId if provided
      if (data.listId) {
        mysqlUpdateData.listId = data.listId;
      }
  
      // Update in MySQL first
      await Card.update(mysqlUpdateData, { where: { id } });
  
      // Now handle MongoDB update
      const existingMongoCard = await CardMongo.findOne({ mysqlId: id.toString() });
      if (!existingMongoCard) {
        console.warn(`Card with MySQL ID ${id} not found in MongoDB`);
        return mysqlCard;
      }
  
      // Prepare MongoDB update data
      const mongoUpdateData = {
        title: mysqlUpdateData.title,
        description: mysqlUpdateData.description,
        dueDate: mysqlUpdateData.dueDate,
        priority: mysqlUpdateData.priority,
        labels: data.labels || [],
        checklist: data.checklist || [],
        updatedAt: mysqlUpdateData.updatedAt
      };
  
      // Handle listId for MongoDB
      if (data.listId) {
        const mongoList = await ListMongo.findOne({ mysqlId: data.listId.toString() });
        if (mongoList) {
          mongoUpdateData.listId = mongoList._id;
        }
      }
  
      // Handle attachments
      if (data.attachments || data.removedAttachments) {
        // Get current attachments (as ObjectIds)
        const currentAttachments = existingMongoCard.attachments || [];
        
        // Filter out removed attachments
        const keptAttachments = currentAttachments.filter(attId => 
          !(data.removedAttachments || []).some(removedId => 
            removedId.toString() === attId.toString()
          )
        );
  
        // Process new attachments
        const newAttachments = await Promise.all(
          (data.attachments || [])
            .filter(att => !att._id) // Only process new attachments
            .map(async attachment => {
              const newAttachment = await AttachmentMongo.create({
                name: attachment.name,
                type: attachment.type,
                size: attachment.size,
                data: attachment.data,
                cardId: existingMongoCard._id
              });
              return newAttachment._id;
            })
        );
  
        // Combine kept and new attachments
        mongoUpdateData.attachments = [...keptAttachments, ...newAttachments];
      }
  
      // Update in MongoDB
      const updatedMongoCard = await CardMongo.findOneAndUpdate(
        { mysqlId: id.toString() },
        { $set: mongoUpdateData },
        { new: true }
      ).populate([
        { path: 'createdById', model: 'UserMongo' },
        { path: 'listId', model: 'ListMongo' },
        { path: 'attachments', model: 'AttachmentMongo' }
      ]);
  
      // Clean up removed attachments
      if (data.removedAttachments?.length) {
        await AttachmentMongo.deleteMany({ 
          _id: { $in: data.removedAttachments.map(id => new mongoose.Types.ObjectId(id)) }
        });
      }
  
      // Log success
      if (userId) {
        await Log.create({
          userId: userId,
          action: 'UPDATE_CARD_SUCCESS',
          details: `Updated card with ID ${id}`
        });
      } else {
        await Log.create({
          action: 'UPDATE_CARD_SUCCESS',
          details: `Updated card with ID ${id} (no user ID provided)`
        });
      }
  
      return updatedMongoCard ? updatedMongoCard.toObject() : mysqlCard;
    } catch (error) {
      console.error("Error updating Card:", error);
      
      // Still log the error but don't require userId
      try {
        await Log.create({
          userId: data.userId || data.createdById || null,
          action: 'UPDATE_CARD_ERROR',
          details: `Error updating card ${id}: ${error.message}`
        });
      } catch (logError) {
        console.error("Error logging card update failure:", logError);
      }
      
      throw new Error('Error updating Card: ' + error.message);
    }
  }



  async delete(id, userId) {
    try {

      const mysqlCard = await Card.findOne({ where: { id } });
      if (!mysqlCard) {
        throw new Error("Card not found in MySQL");
      }
      const userId = mysqlCard.createdById;


      // Delete from MySQL
      const deletedMySQL = await Card.destroy({ where: { id } });

      
      
      // Delete from MongoDB
      await CardMongo.deleteOne({ mysqlId: id });

        await Log.create({
                userId: userId,
                action: 'DELETE_CARD_SUCCESS',
                details: `Successfully deleted list with ID ${id}`
            });
      
      return deletedMySQL;
    } catch (error) {
      console.error("Error deleting Card:", error);
      throw new Error('Error deleting Card: ' + error.message);
    }
  }
}

module.exports = new CardRepository();


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
  
      return mysqlResource;
    } catch (error) {
      console.error("Error creating Card:", error);
      throw new Error('Error creating Card: ' + error.message);
    }
  }
  
  async update(id, data) {
    try {
        let mongoListId = null;
        let mysqlListId = null;

        // Handle listId update if provided
        if (data.listId) {
            // First try to find the list in MySQL
            const mysqlList = await List.findOne({ 
                where: { id: data.listId } 
            });

            if (!mysqlList) {
                // If not found in MySQL, check MongoDB by mysqlId
                const mongoList = await ListMongo.findOne({ 
                    mysqlId: data.listId.toString() 
                });

                if (!mongoList) {
                    throw new Error(`List with ID ${data.listId} not found in either database`);
                }

                // Found in MongoDB but not MySQL - this is a problem
                throw new Error(`List with ID ${data.listId} exists in MongoDB but not MySQL`);
            }

            // List exists in MySQL, now verify in MongoDB
            mysqlListId = mysqlList.id;
            const mongoList = await ListMongo.findOne({ 
                mysqlId: mysqlListId.toString() 
            });

            if (!mongoList) {
                console.warn(`List with MySQL ID ${mysqlListId} not found in MongoDB`);
            } else {
                mongoListId = mongoList._id;
            }
        }

        // Prepare MySQL update data
        const mysqlUpdateData = { ...data };
        if (data.listId) {
            mysqlUpdateData.listId = mysqlListId;
        }

        // Update in MySQL
        const [updatedCount] = await Card.update(mysqlUpdateData, { 
            where: { id } 
        });
        
        if (updatedCount === 0) {
            throw new Error("Card not found in MySQL");
        }

        // Get existing card from MongoDB
        const existingCard = await CardMongo.findOne({ mysqlId: id });
        if (!existingCard) {
            throw new Error("Card not found in MongoDB");
        }

        // Prepare MongoDB update data
        const mongoUpdateData = {
            title: data.title || existingCard.title,
            description: data.description || existingCard.description || "",
            updatedAt: new Date()
        };

        // Only update listId if we have a valid mongoListId
        if (mongoListId) {
            mongoUpdateData.listId = mongoListId;
        }

        // Process attachments if needed
        if (data.attachments || data.removedAttachments) {
            const existingAttachmentIds = existingCard.attachments || [];
            const newAttachments = data.attachments || [];
            const removedAttachmentIds = data.removedAttachments || [];
            
            const attachmentsToKeep = existingAttachmentIds.filter(id => 
                !removedAttachmentIds.includes(id.toString())
            );
            
            const attachmentsToAdd = newAttachments.filter(att => !att._id);
            const savedAttachments = await Promise.all(
                attachmentsToAdd.map(async attachment => {
                    const newAttachment = new AttachmentMongo({
                        name: attachment.name,
                        type: attachment.type,
                        size: attachment.size,
                        data: attachment.data,
                        cardId: existingCard._id
                    });
                    return await newAttachment.save();
                })
            );

            mongoUpdateData.attachments = [
                ...attachmentsToKeep,
                ...savedAttachments.map(att => att._id)
            ];
        }

        // Update in MongoDB
        const updatedMongoDB = await CardMongo.findOneAndUpdate(
            { mysqlId: id },
            { $set: mongoUpdateData },
            { new: true }
        ).populate([
            { path: 'createdById', model: 'UserMongo' },
            { path: 'listId', model: 'ListMongo' },
            { path: 'attachments', model: 'AttachmentMongo' }
        ]);

        if (!updatedMongoDB) {
            throw new Error("Failed to update card in MongoDB");
        }

        return updatedMongoDB.toObject();
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

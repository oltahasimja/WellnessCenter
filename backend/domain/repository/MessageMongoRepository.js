const MessageMongo = require("../database/models/Mongo/MessageMongo");
const mongoose = require('mongoose');
const { isValidObjectId, Types } = mongoose;

class MessageMongoRepository {
  async findAll() {
    return MessageMongo.find()
      .populate({
        path: 'userId',
        select: 'name lastName mysqlId profileImage',
        populate: {
          path: 'profileImageId',
          select: 'name data'
        }
      })
      .lean();
  }
  
async findByGroupId(groupId) {
const filter = isValidObjectId(groupId)
  ? { groupId: new Types.ObjectId(groupId) } 
  : { 'groupId.mysqlId': groupId };
  return MessageMongo.find(filter)
    .populate({
      path: 'userId',
      select: 'name lastName mysqlId profileImageId',
      populate: {
        path: 'profileImageId',
        select: 'name data'
      }
    })
    .populate({
      path: 'seenBy.userId',
      select: 'name lastName mysqlId'
    })
    .sort({ createdAt: 1 })
    .lean();
}
  
  async findById(id) {
    return MessageMongo.findById(id)
      .populate('userId', 'name lastName mysqlId')
      .lean();
  }
  
  async create(data) {
    const newMessage = new MessageMongo(data);
    await newMessage.save();
    return MessageMongo.findById(newMessage._id)
      .populate('userId', 'name lastName mysqlId')
      .lean();
  }
  
  async update(id, data) {
    return MessageMongo.findByIdAndUpdate(id, data, { 
      new: true 
    })
    .populate('userId', 'name lastName mysqlId')
    .lean();
  }
  
  async delete(id) {
    return MessageMongo.findByIdAndDelete(id)
      .populate('userId', 'name lastName mysqlId')
      .lean();
  }
}

module.exports = new MessageMongoRepository();
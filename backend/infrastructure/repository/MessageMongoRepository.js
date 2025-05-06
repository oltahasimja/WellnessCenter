// infrastructure/repository/MessageMongoRepository.js
const MessageMongo = require("../database/models/Mongo/MessageMongo");

class MessageMongoRepository {
  async findAll() {
    return MessageMongo.find().populate('userId', 'name lastName');
  }
  
  async findByGroupId(groupId) {
    return MessageMongo.find({ groupId })
      .populate('userId', 'name lastName')
      .sort({ createdAt: 1 });
  }
  
  async findById(id) {
    return MessageMongo.findById(id).populate('userId', 'name lastName');
  }
  
  async create(data) {
    const newMessage = new MessageMongo(data);
    return newMessage.save();
  }
  
  async update(id, data) {
    return MessageMongo.findByIdAndUpdate(id, data, { new: true });
  }
  
  async delete(id) {
    return MessageMongo.findByIdAndDelete(id);
  }
}

module.exports = new MessageMongoRepository();
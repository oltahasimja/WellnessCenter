// adapters/controllers/MessageMongoController.js
const MessageMongoRepository = require("../../domain/repository/MessageMongoRepository");
const MessageMongoPort = require("../../application/ports/MessageMongoPort");
const MessageMongoUseCase = require("../../application/use-cases/MessageMongoUseCase");

const port = new MessageMongoPort(MessageMongoRepository);
const UseCase = new MessageMongoUseCase(port);

const getAllMessageMongos = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessagesByGroupId = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    
    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const messages = await MessageMongoRepository.findByGroupId(groupId);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMessageMongoById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "MessageMongo not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMessageMongo = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMessageMongo = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "MessageMongo not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMessageMongo = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "MessageMongo deleted" });
    } else {
      res.status(404).json({ message: "MessageMongo not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getAllMessageMongos, 
  getMessageMongoById,
  getMessagesByGroupId,
  createMessageMongo, 
  updateMessageMongo, 
  deleteMessageMongo
};
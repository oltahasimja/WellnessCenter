
const CardMemberRepository = require("../../domain/repository/CardMemberRepository");
const CardMemberPort = require("../../application/ports/CardMemberPort");
const CardMemberUseCase = require("../../application/use-cases/CardMemberUseCase");
const port = new CardMemberPort(CardMemberRepository);
const UseCase = new CardMemberUseCase(port);
const getAllCardMembers = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getCardMemberById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "CardMember not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createCardMember = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateCardMember = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "CardMember not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteCardMember = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "CardMember deleted" });
    } else {
      res.status(404).json({ message: "CardMember not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCardMembersByCardId = async (req, res) => {
  try {
    const { cardId } = req.query;
    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required' });
    }
    
    const result = await UseCase.getByCardId(cardId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllCardMembers, 
  getCardMemberById, 
  createCardMember, 
  updateCardMember, 
  deleteCardMember,
  getCardMembersByCardId
};

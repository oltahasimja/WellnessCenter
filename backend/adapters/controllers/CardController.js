
const CardRepository = require("../../domain/repository/CardRepository");
const CardPort = require("../../application/ports/CardPort");
const CardUseCase = require("../../application/use-cases/CardUseCase");
const port = new CardPort(CardRepository);
const UseCase = new CardUseCase(port);
const getAllCards = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getCardById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Card not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createCard = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateCard = async (req, res) => {


  try {
    if (req.body.profileImage) {
      req.body.profileImage = req.body.profileImage;
    }

    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Card not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteCard = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "Card deleted" });
    } else {
      res.status(404).json({ message: "Card not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllCards, 
  getCardById, 
  createCard, 
  updateCard, 
  deleteCard
};

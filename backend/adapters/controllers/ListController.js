
const ListRepository = require("../../infrastructure/repository/ListRepository");
const ListPort = require("../../application/ports/ListPort");
const ListUseCase = require("../../application/use-cases/ListUseCase");
const port = new ListPort(ListRepository);
const UseCase = new ListUseCase(port);
const getAllLists = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getListById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "List not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createList = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateList = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "List not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteList = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "List deleted" });
    } else {
      res.status(404).json({ message: "List not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllLists, 
  getListById, 
  createList, 
  updateList, 
  deleteList
};

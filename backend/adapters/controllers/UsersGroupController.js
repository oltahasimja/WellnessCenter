
const UsersGroupRepository = require("../../infrastructure/repository/UsersGroupRepository");
const UsersGroupPort = require("../../application/ports/UsersGroupPort");
const UsersGroupUseCase = require("../../application/use-cases/UsersGroupUseCase");
const port = new UsersGroupPort(UsersGroupRepository);
const UseCase = new UsersGroupUseCase(port);
const getAllUsersGroups = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUsersGroupById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "UsersGroup not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createUsersGroup = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateUsersGroup = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "UsersGroup not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteUsersGroup = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "UsersGroup deleted" });
    } else {
      res.status(404).json({ message: "UsersGroup not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllUsersGroups, 
  getUsersGroupById, 
  createUsersGroup, 
  updateUsersGroup, 
  deleteUsersGroup
};

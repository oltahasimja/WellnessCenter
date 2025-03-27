
const UserProgramsRepository = require("../../infrastructure/repository/UserProgramsRepository");
const UserProgramsPort = require("../../application/ports/UserProgramsPort");
const UserProgramsUseCase = require("../../application/use-cases/UserProgramsUseCase");
const port = new UserProgramsPort(UserProgramsRepository);
const UseCase = new UserProgramsUseCase(port);
const getAllUserProgramss = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserProgramsById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "UserPrograms not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createUserPrograms = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateUserPrograms = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "UserPrograms not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteUserPrograms = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "UserPrograms deleted" });
    } else {
      res.status(404).json({ message: "UserPrograms not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllUserProgramss, 
  getUserProgramsById, 
  createUserPrograms, 
  updateUserPrograms, 
  deleteUserPrograms
};

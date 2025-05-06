
const ProgramRepository = require("../../domain/repository/ProgramRepository");
const ProgramPort = require("../../application/ports/ProgramPort");
const ProgramUseCase = require("../../application/use-cases/ProgramUseCase");
const port = new ProgramPort(ProgramRepository);
const UseCase = new ProgramUseCase(port);
const getAllPrograms = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getProgramById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Program not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createProgram = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateProgram = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Program not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const deletingUserId = req.body.userId; // Get from request body
    
    const result = await UseCase.delete(id, deletingUserId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};
module.exports = { 
  getAllPrograms, 
  getProgramById, 
  createProgram, 
  updateProgram, 
  deleteProgram
};

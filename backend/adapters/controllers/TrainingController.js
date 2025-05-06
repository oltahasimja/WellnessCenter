
const TrainingRepository = require("../../domain/repository/TrainingRepository");
const TrainingPort = require("../../application/ports/TrainingPort");
const TrainingUseCase = require("../../application/use-cases/TrainingUseCase");
const port = new TrainingPort(TrainingRepository);
const UseCase = new TrainingUseCase(port);
const getAllTrainings = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getTrainingById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Training not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createTraining = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateTraining = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Training not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteTraining = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "Training deleted" });
    } else {
      res.status(404).json({ message: "Training not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllTrainings, 
  getTrainingById, 
  createTraining, 
  updateTraining, 
  deleteTraining
};

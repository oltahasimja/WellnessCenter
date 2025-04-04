
const TrainingApplicationRepository = require("../../infrastructure/repository/TrainingApplicationRepository");
const TrainingApplicationPort = require("../../application/ports/TrainingApplicationPort");
const TrainingApplicationUseCase = require("../../application/use-cases/TrainingApplicationUseCase");
const port = new TrainingApplicationPort(TrainingApplicationRepository);
const UseCase = new TrainingApplicationUseCase(port);
const getAllTrainingApplications = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getTrainingApplicationById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "TrainingApplication not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createTrainingApplication = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateTrainingApplication = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "TrainingApplication not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteTrainingApplication = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "TrainingApplication deleted" });
    } else {
      res.status(404).json({ message: "TrainingApplication not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllTrainingApplications, 
  getTrainingApplicationById, 
  createTrainingApplication, 
  updateTrainingApplication, 
  deleteTrainingApplication
};

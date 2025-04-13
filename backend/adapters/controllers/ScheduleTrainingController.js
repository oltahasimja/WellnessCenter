
const ScheduleTrainingRepository = require("../../infrastructure/repository/ScheduleTrainingRepository");
const ScheduleTrainingPort = require("../../application/ports/ScheduleTrainingPort");
const ScheduleTrainingUseCase = require("../../application/use-cases/ScheduleTrainingUseCase");
const port = new ScheduleTrainingPort(ScheduleTrainingRepository);
const UseCase = new ScheduleTrainingUseCase(port);
const getAllScheduleTrainings = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getScheduleTrainingById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "ScheduleTraining not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createScheduleTraining = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateScheduleTraining = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "ScheduleTraining not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteScheduleTraining = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "ScheduleTraining deleted" });
    } else {
      res.status(404).json({ message: "ScheduleTraining not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllScheduleTrainings, 
  getScheduleTrainingById, 
  createScheduleTraining, 
  updateScheduleTraining, 
  deleteScheduleTraining
};

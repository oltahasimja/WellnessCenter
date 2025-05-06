
const ScheduleRepository = require("../../domain/repository/ScheduleRepository");
const SchedulePort = require("../../application/ports/SchedulePort");
const ScheduleUseCase = require("../../application/use-cases/ScheduleUseCase");
const port = new SchedulePort(ScheduleRepository);
const UseCase = new ScheduleUseCase(port);
const getAllSchedules = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getScheduleById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Schedule not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createSchedule = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateSchedule = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Schedule not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteSchedule = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "Schedule deleted" });
    } else {
      res.status(404).json({ message: "Schedule not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllSchedules, 
  getScheduleById, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule
};

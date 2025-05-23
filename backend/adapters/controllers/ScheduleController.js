
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
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

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
    const { workDays, startTime, endTime, unavailableDates = [] } = req.body;

    if (!Array.isArray(workDays) || workDays.length === 0) {
      return res.status(400).json({ message: "workDays must be a non-empty array" });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime)) {
      return res.status(400).json({ message: "Invalid startTime format" });
    }

    if (!timeRegex.test(endTime)) {
      return res.status(400).json({ message: "Invalid endTime format" });
    }

    // Add startTime/endTime comparison validation
    if (startTime >= endTime) {
      return res.status(400).json({ message: "startTime must be before endTime" });
    }

    if (Array.isArray(unavailableDates) && unavailableDates.length > 1000) {
      return res.status(400).json({ message: "Too many unavailable dates" });
    }

    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateSchedule = async (req, res) => {
  try {
    const { workDays, startTime, endTime, unavailableDates = [] } = req.body;

    if (!Array.isArray(workDays) || workDays.length === 0) {
      return res.status(400).json({ message: "workDays must be a non-empty array" });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime)) {
      return res.status(400).json({ message: "Invalid startTime format" });
    }

    if (!timeRegex.test(endTime)) {
      return res.status(400).json({ message: "Invalid endTime format" });
    }

    // 🔴 ADD THIS BLOCK
    if (startTime >= endTime) {
      return res.status(400).json({ message: "startTime must be before endTime" });
    }

    if (Array.isArray(unavailableDates) && unavailableDates.length > 1000) {
      return res.status(400).json({ message: "Too many unavailable dates" });
    }

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
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

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

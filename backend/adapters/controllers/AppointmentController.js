
const AppointmentRepository = require("../../infrastructure/repository/AppointmentRepository");
const AppointmentPort = require("../../application/ports/AppointmentPort");
const AppointmentUseCase = require("../../application/use-cases/AppointmentUseCase");
const port = new AppointmentPort(AppointmentRepository);
const UseCase = new AppointmentUseCase(port);




const getAllAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const result = await UseCase.getAll(filter);
    res.json(result);
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ 
      message: error.message,
      details: error.stack 
    });
  }
};


const getAppointmentById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createAppointment = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const createAppointment = async (req, res) => {
//   try {
//     // Check for existing appointments at this time
//     const existingAppointments = await AppointmentMongo.find({
//       specialistId: req.body.specialistId,
//       appointmentDate: {
//         $gte: new Date(new Date(req.body.appointmentDate).setMinutes(0)),
//         $lt: new Date(new Date(req.body.appointmentDate).setHours(23, 59, 59))
//       },
//       status: { $ne: 'canceled' }
//     });

//     if (existingAppointments.length > 0) {
//       return res.status(400).json({ 
//         message: "This time slot is already booked. Please choose another time." 
//       });
//     }

//     const newResource = await UseCase.create(req.body);
//     res.status(201).json(newResource);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// In your appointmentController.js
const updateAppointment = async (req, res) => {
  try {
    // Only allow certain fields to be updated
    const allowedUpdates = ['status', 'notes', 'appointmentDate'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Pass the MongoDB _id directly
    const updatedResource = await UseCase.update(req.params.id, updates);
    
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteAppointment = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "Appointment deleted" });
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { 
  getAllAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment,
};

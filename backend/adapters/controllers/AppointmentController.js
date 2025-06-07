
const nodemailer = require('nodemailer');

const AppointmentRepository = require("../../domain/repository/AppointmentRepository");
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // email address from which to send
    pass: process.env.EMAIL_PASS   // password of the email
  }
});

const createAppointment = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const allowedUpdates = ['status', 'notes', 'appointmentDate'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const updatedResource = await UseCase.update(req.params.id, updates);

    if (!updatedResource) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = await UseCase.getById(req.params.id);

    // Confirmation email
    if (updates.status === 'confirmed') {
      if (appointment?.userId?.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: appointment.userId.email,
          subject: 'Appointment Confirmation',
          text: `Your appointment has been confirmed!\n\n` +
                `- Specialist: ${appointment.specialistId.name} ${appointment.specialistId.lastName}\n` +
                `- Date: ${new Date(appointment.appointmentDate).toLocaleString()}\n` +
                `- Type: ${appointment.type}\n\n` +
                `Thank you for using our platform.`
        };
        await transporter.sendMail(mailOptions);
      }
    }

    // Cancellation email with reason
    if (updates.status === 'canceled') {
      if (appointment?.userId?.email) {
        const reason = req.body.cancelReason || 'No reason provided.';
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: appointment.userId.email,
          subject: 'Appointment Canceled',
          text: `Your appointment has been canceled.\n\n` +
                `Reason: ${reason}\n\n` +
                `- Specialist: ${appointment.specialistId.name} ${appointment.specialistId.lastName}\n` +
                `- Date: ${new Date(appointment.appointmentDate).toLocaleString()}\n` +
                `- Type: ${appointment.type}`
        };
        await transporter.sendMail(mailOptions);
      }
    }

    res.json(updatedResource);
  } catch (error) {
    console.error('Error updating appointment:', error);
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


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
    
    if (updatedResource) {
      if (updates.status === 'confirmed') {
        try {
          const appointment = await UseCase.getById(req.params.id);
          
          if (appointment && appointment.userId && appointment.userId.email) {
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: appointment.userId.email,
              subject: 'Appointment Confirmation',
              text: `Your appointment has been confirmed successfully!\n\n` +
                    `Details:\n` +
                    `- Specialist: ${appointment.specialistId.name} ${appointment.specialistId.lastName}\n` +
                    `- Date: ${new Date(appointment.appointmentDate).toLocaleString()}\n` +
                    `- Type: ${appointment.type}\n\n` +
                    `Thank you for using our service!`
            };

            await transporter.sendMail(mailOptions);
            console.log('Confirmation email sent to:', appointment.userId.email);
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const updateAppointment = async (req, res) => {
//   try {
//     // Only allow certain fields to be updated
//     const allowedUpdates = ['status', 'notes', 'appointmentDate'];
//     const updates = Object.keys(req.body)
//       .filter(key => allowedUpdates.includes(key))
//       .reduce((obj, key) => {
//         obj[key] = req.body[key];
//         return obj;
//       }, {});

//     // Pass the MongoDB _id directly
//     const updatedResource = await UseCase.update(req.params.id, updates);
    
//     if (updatedResource) {
//       res.json(updatedResource);
//     } else {
//       res.status(404).json({ message: "Appointment not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


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

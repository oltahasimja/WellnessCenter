const nodemailer = require('nodemailer');
const UserProgramsRepository = require("../../domain/repository/UserProgramsRepository");
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


// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,  // email address from which to send
//     pass: process.env.EMAIL_PASS   // password of the email
//   }
// });

const createUserPrograms = async (req, res) => {
  try {
    console.log("Received data for creation:", req.body);
    
    const newResource = await UseCase.create(req.body);
    console.log("Successfully created in MongoDB:", newResource);
    
    const userId = req.body.userId;
    const programId = req.body.programId;
    
    const UserRepository = require("../../domain/repository/UserRepository");
    const ProgramRepository = require("../../domain/repository/ProgramRepository");
    
    const user = await UserRepository.findById(userId);
    const program = await ProgramRepository.findById(programId);
    
    if (user && user.email && program) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Program ${program.title} invite`,
        text: `You have been added to the program ${program.title}`
      };
      
      try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else {
      // console.log("Cannot send email - user or program data not found");
      // console.log("User data:", user);
      // console.log("Program data:", program);
    }
   
    res.status(201).json(newResource);
    
  } catch (error) {
    console.error('Error in createUserPrograms:', error);
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
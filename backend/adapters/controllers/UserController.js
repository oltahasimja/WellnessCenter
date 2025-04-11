
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const nodemailer = require('nodemailer');

const UserRepository = require("../../infrastructure/repository/UserRepository");
const UserPort = require("../../application/ports/UserPort");
const UserUseCase = require("../../application/use-cases/UserUseCase");
const port = new UserPort(UserRepository);
const UseCase = new UserUseCase(port);


const getSpecialists = async (req, res) => {
  try {
    const specialists = await UseCase.getSpecialists();
    res.json(specialists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const getAllUsers = async (req, res) => {
  try {
    const result = await UseCase.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "User not found" });
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



// const createUser = async (req, res) => {
//   try {
//     const newResource = await UseCase.create(req.body);
//     res.status(201).json(newResource);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const createUser = async (req, res) => {
  try {
    console.log(req.body);

    // const randomPassword = crypto.randomBytes(8).toString('hex'); // 16 karaktere

     const randomPassword = 'bani1234'; // 16 karaktere

    
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    const newUser = await UseCase.create({ ...req.body, password: hashedPassword });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: 'Your Account Details',
      text: `Hello ${req.body.username},\n\nYour account has been created.
      \nYour username is: ${req.body.username}\n
      \nYour password is: ${randomPassword}\n\nPlease change it after login.\n\nThank you!`
    };
    
    // Dergo emailin
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error('Error sending email:', error);
    //   } else {
    //     console.log('Email sent: ' + info.response);
    //   }
    // });

    res.status(201).json(newUser);
    
  } catch (error) {
    console.error("Gabim në krijimin e përdoruesit:", error);

    res.status(500).json({ error: error.message });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const users = await UseCase.findByRole(roleId);
    res.json(users);
  } catch (error) {
    console.error('Error getting users by role:', error);
    res.status(500).json({ message: error.message });
  }
};




const updateUser = async (req, res) => {
  try {
    if (req.body.profileImage) {
      req.body.profileImage = req.body.profileImage;
    }
    
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "User deleted" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    await UseCase.updatePassword(id, currentPassword, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(400).json({ 
      message: error.message || "Failed to update password" 
    });
  }
};
module.exports = { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getSpecialists,
  getUsersByRole,
  updatePassword
};

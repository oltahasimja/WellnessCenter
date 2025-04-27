// In your auth routes file
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const User = require('../infrastructure/database/models/MySQL/User'); 
const UserMongo = require('../infrastructure/database/models/Mongo/UserMongo');
// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    console.log('Before MySQL update:', {
      resetToken,
      resetTokenExpiry,
      currentValues: {
        token: user.resetPasswordToken,
        expires: user.resetPasswordExpires
      }
    });

    // Update MySQL
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    console.log('After MySQL update:', {
      token: user.resetPasswordToken,
      expires: user.resetPasswordExpires
    });

    // Update MongoDB
    try {
      const userMongo = await UserMongo.findOne({ email });
      if (userMongo) {
        userMongo.resetPasswordToken = resetToken;
        userMongo.resetPasswordExpires = resetTokenExpiry;
        await userMongo.save();
        console.log('MongoDB update successful');
      }
    } catch (mongoError) {
      console.error('Error updating token in MongoDB:', mongoError);
    }
  
      // Send email
      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
      
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: `You are receiving this because you requested a password reset.\n\n
          Please click on the following link to complete the process:\n\n
          ${resetUrl}\n\n
          If you did not request this, please ignore this email.`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error sending reset email' });
    }
  });

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update MySQL
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    // Update MongoDB
    try {
      await UserMongo.updateOne(
        { email: user.email },
        { 
          $set: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
          }
        }
      );
    } catch (mongoError) {
      console.error('Error updating MongoDB:', mongoError);
    }

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;

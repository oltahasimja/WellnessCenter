// In your auth routes file
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const User = require('../infrastructure/database/models/User'); 
const UserMongo = require('../infrastructure/database/models/UserMongo');
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
  
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();
  
      try {
        const userMongo = await UserMongo.findOne({ email });
        if (userMongo) {
          userMongo.resetPasswordToken = resetToken;
          userMongo.resetPasswordExpires = resetTokenExpiry;
          await userMongo.save();
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
    
    // Correct Sequelize query syntax for MySQL
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
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    try {
      const userMongo = await UserMongo.findOne({ email: user.email });
      if (userMongo) {
        userMongo.password = hashedPassword; 
        await userMongo.save();
      }
    } catch (mongoError) {
      console.error('Error updating password in MongoDB:', mongoError);
    }

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;

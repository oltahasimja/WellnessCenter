

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const nodemailer = require('nodemailer');

const Role = require('../../infrastructure/database/models/Role')

const User = require('../../infrastructure/database/models/User')

const registerUserForm = async (req, res) => {
    const { name, lastName, number, email, username, password } = req.body;
  
    try {
      const userRole = await Role.findOne({ where: { name: 'User' } });
  
      if (!userRole) {
        return res.status(500).json({ error: "Roli 'User' nuk ekziston në databazë" });
      }
  
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        lastName,
        number,
        email,
        username,
        password: hash,
        roleId: userRole.id, 
      });
  
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  
  
  const loginUser = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
      if (err) return next(err);
  
      if (!user) {
        return res.status(401).json({ message: 'Login i dështuar. Provoni përsëri.' });
      }
  
      req.logIn(user, (err) => {
        if (err) return next(err);
  
        const accessToken = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1d' } // Access token skadon për 15 min
        );
  
        const refreshToken = jwt.sign(
          { id: user.id },
          process.env.REFRESH_SECRET,
          { expiresIn: '7d' } // Refresh token skadon për 7 ditë
        );
  
        // Ruaj refresh token-in në cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ditë
        });
  
        res.cookie('ubtsecured', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 15 * 60 * 1000, // 15 min
        });
  
        res.status(200).json({ message: 'Login i suksesshëm', accessToken, refreshToken });
      });
    })(req, res, next);
  };
  
  const getByUsername = async (req, res) => {
    try {
      const user = await User.findOne({ where: { username: req.params.username } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  module.exports = {loginUser, registerUserForm, getByUsername };



const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const nodemailer = require('nodemailer');
const sequelize  = require('../../config/database');
const { Op } = require('sequelize');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// const Role = require('../../domain/database/models/Role')

// const User = require('../../domain/database/models/User')
const UserMongo = require('../../domain/database/models/Mongo/UserMongo')
const RoleMongo = require('../../domain/database/models/Mongo/RoleMongo')


const { User, Country, City, ProfileImage, Role } = require('../../domain/database/models/index');


const googleAuth = async (req, res) => {
  const { token } = req.body;
  let mysqlTransaction;
  let committed = false;

  try {
    // 1. Verifiko token-in nga Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub } = payload;

    mysqlTransaction = await sequelize.transaction();

    let mysqlUser = await User.findOne({
      where: { email },
      transaction: mysqlTransaction
    });

    if (!mysqlUser) {
      const userRole = await Role.findOne({
        where: { name: 'Client' },
        transaction: mysqlTransaction
      });

      if (!userRole) {
        await mysqlTransaction.rollback();
        return res.status(500).json({ error: 'Roli Client nuk u gjet.' });
      }

      mysqlUser = await User.create({
        name: given_name,
        lastName: family_name || '',
        email,
        number: '12345',
        username: email.split('@')[0],
        password: sub, 
        roleId: userRole.id,
        isGoogleAuth: true
      }, { transaction: mysqlTransaction });

      const mongoRole = await RoleMongo.findOne({ name: 'Client' });
      if (!mongoRole) {
        await mysqlTransaction.rollback();
        return res.status(500).json({ error: 'Roli Mongo Client nuk u gjet.' });
      }

      const mongoUser = new UserMongo({
        mysqlId: mysqlUser.id.toString(),
        name: given_name,
        lastName: family_name || '',
        email,
        number: '12345',
        username: email.split('@')[0],
        password: sub,
        roleId: mongoRole._id,
        isGoogleAuth: true
      });

      await mongoUser.save();
    }

    await mysqlTransaction.commit();
    committed = true;

    const accessToken = jwt.sign(
      { id: mysqlUser.id, username: mysqlUser.username, role: 'Client' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: mysqlUser.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // 7. Vendos cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('ubtsecured', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Google auth sukses.',
      user: {
            id: mysqlUser.id,
            name: mysqlUser.name,
            email: mysqlUser.email,
            username: mysqlUser.username,
            },
      accessToken,
      refreshToken
    });

  } catch (error) {
    if (!committed && mysqlTransaction) {
      try {
        await mysqlTransaction.rollback();
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
    }
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'Autentifikimi me Google dështoi.' });
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
                { id: user.id, username: user.username, role: user.Role?.name || 'Client' },
          process.env.JWT_SECRET,
          { expiresIn: '1d' } 
        );
  
        const refreshToken = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.REFRESH_SECRET,
          { expiresIn: '7d' } 
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
        //   maxAge: 15 * 60 * 1000, // 15 min
          maxAge: 24 * 60 * 60 * 1000 // 24 orë

        });
  
        res.status(200).json({ 
        message: 'Login i suksesshëm', 
        accessToken, 
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        }
});     
 });
    })(req, res, next);
  };
  
  const getByUsernameOrEmail = async (req, res) => {
    try {
        const user = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { username: req.params.identifier },
                    { email: req.params.identifier }
                ]
            } 
        });
        
        if (user) {
            return res.json({ 
                exists: true,
                type: user.username === req.params.identifier ? 'username' : 'email'
            });
        }
        res.json({ exists: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getUserByIdentifier = async (req, res) => {
    try {
        const user = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { username: req.params.identifier },
                    { email: req.params.identifier }
                ]
            },
            // include: ['profileImageId'] // Include any associations you need
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
  

  module.exports = {loginUser, getByUsernameOrEmail, googleAuth, getUserByIdentifier};  

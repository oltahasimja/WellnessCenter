

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
  
  try {
      // Verify Google token
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      const { email, given_name, family_name, sub, picture } = payload;

      // Start transaction
      mysqlTransaction = await sequelize.transaction();

      try {
          // Check if user exists
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
                  return res.status(500).json({ error: 'User role not found' });
              }

              // Create user in MySQL
              mysqlUser = await User.create({
                  name: given_name,
                  lastName: family_name || '',
                  email,
                  number: '12345',
                  username: email.split('@')[0],
                  password: sub,
                  roleId: userRole.id,
                  isGoogleAuth: true,
                
              }, { transaction: mysqlTransaction });

              // Create user in MongoDB
              try {
                  const mongoRole = await RoleMongo.findOne({ name: 'Client' });
                  if (!mongoRole) {
                      await mysqlTransaction.rollback();
                      return res.status(500).json({ error: 'MongoDB role not found' });
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
                      isGoogleAuth: true,
                      // avatar: picture
                  });

                  await mongoUser.save();
              } catch (mongoError) {
                  await mysqlTransaction.rollback();
                  console.error('MongoDB error:', mongoError);
                  return res.status(500).json({ error: 'Failed to create MongoDB user' });
              }
          }

          // Commit transaction if everything succeeded
          await mysqlTransaction.commit();

          // Generate tokens
          const accessToken = jwt.sign(
              { id: mysqlUser.id, username: mysqlUser.username, role: mysqlUser.role },
              process.env.JWT_SECRET,
              { expiresIn: '1d' }
          );

          const refreshToken = jwt.sign(
              { id: mysqlUser.id },
              process.env.REFRESH_SECRET,
              { expiresIn: '7d' }
          );

          // Set cookies
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
              maxAge: 15 * 60 * 1000,
          });

          return res.status(200).json({ 
              message: 'Google authentication successful', 
              user: {
                  id: mysqlUser.id,
                  name: mysqlUser.name,
                  email: mysqlUser.email
              },
              accessToken,
              refreshToken
          });

      } catch (dbError) {
          if (mysqlTransaction) await mysqlTransaction.rollback();
          console.error('Database error:', dbError);
          return res.status(500).json({ error: 'Database operation failed' });
      }

  } catch (error) {
      console.error('Google auth error:', error);
      return res.status(500).json({ error: 'Google authentication failed' });
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
          { expiresIn: '1d' } 
        );
  
        const refreshToken = jwt.sign(
          { id: user.id },
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
          maxAge: 15 * 60 * 1000, // 15 min
        });
  
        res.status(200).json({ message: 'Login i suksesshëm', accessToken, refreshToken });
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

  

  module.exports = {loginUser, getByUsernameOrEmail, googleAuth  };

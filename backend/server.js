require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const sequelize = require('./config/database');
const isAuthenticated = require('./middlewares/authMiddleware').isAuthenticated;

const mongoose = require('mongoose')
const { User, Country, City, ProfileImage, Role, DashboardRole, UsersGroup, Group } = require('./infrastructure/database/models/index');
const { UserMongo, MessageMongo, CountryMongo, CityMongo, ProfileImageMongo, RoleMongo, DashboardRoleMongo, UsersGroupMongo, GroupMongo } = require('./infrastructure/database/models/indexMongo');





const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.0.114:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});



// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Auth middleware
  const isAuthenticated = async (next) => {
    try {
      // Get user info from the session/cookies
      // This would need to be adapted to your auth system
      const userId = socket.handshake.auth.userId || socket.request.session?.passport?.user;
      
      if (!userId) {
        return next(new Error('Not authenticated'));
      }
      
      const user = await UserMongo.findOne({ mysqlId: userId });
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  };

  // Join a chat room (group)
  socket.on('joinRoom', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined room ${groupId}`);
  });

  // Leave a chat room
  socket.on('leaveRoom', (groupId) => {
    socket.leave(groupId);
    console.log(`User ${socket.id} left room ${groupId}`);
  });

  // Handle new message
  socket.on('sendMessage', async (data) => {
    try {
      const { groupId, text, userId } = data;
      
      if (!groupId || !text || !userId) {
        socket.emit('error', 'Missing required fields');
        return;
      }
      
      // Find user in MongoDB
      const user = await UserMongo.findOne({ mysqlId: userId });
      
      if (!user) {
        socket.emit('error', 'User not found');
        return;
      }
      
      // Create and save the message
      const newMessage = new MessageMongo({
        text,
        userId: user._id,
        groupId,
        createdAt: new Date()
      });
      
      await newMessage.save();
      
      // Populate user info for the response
      const populatedMessage = await MessageMongo.findById(newMessage._id)
        .populate('userId', 'name lastName')
        .exec();
      
      // Broadcast to all users in the group
      io.to(groupId).emit('newMessage', populatedMessage);
      
      console.log(`Message sent to group ${groupId} by user ${userId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// app.get('/api/message/:groupId', async (req, res) => {
//   try {
//     const { groupId } = req.params;
    
//     if (!groupId) {
//       return res.status(400).json({ message: "Group ID is required" });
//     }
    
//     const messages = await MessageMongo.find({ groupId })
//       .populate('userId', 'name lastName')
//       .sort({ createdAt: 1 })
//       .exec();
    
//     res.json(messages);
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     res.status(500).json({ message: error.message });
//   }
// });


// Middleware setup
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", " http://192.168.0.114:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// Increase the body size limit to 100MB
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Parandalon sulmet CSRF
    maxAge: 24 * 60 * 60 * 1000, // 24 orë
  },
}));



const routesPath = path.join(__dirname, 'routes');

fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('Routes.js')) {
    const route = require(`./routes/${file}`);
    app.use(`/api/${file.replace('Routes.js', '').toLowerCase()}`, route);
  }
});


app.use(flash());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return done(null, false, { message: 'Përdoruesi nuk u gjet.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Fjalëkalimi është i gabuar.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// const { RoleMongo, DashboardRoleMongo } = require('./infrastructure/database/models')




app.get('/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role },
        {
          model: DashboardRole,
          attributes: ['id', 'name']
        },
        {
          model: Country,
          attributes: ['id', 'name']
        },
        {
          model: City,
          attributes: ['id', 'name'],
          include: [{
            model: Country,
            attributes: ['id', 'name']
          }]
        },
        {
          model: ProfileImage,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        number: user.number,
        username: user.username,
        password: user.password,
        role: user.Role ? user.Role.name : 'User',
        dashboardRole: user.DashboardRole ? user.DashboardRole.name : 'User',
        dashboardRoleId: user.DashboardRole ? user.DashboardRole.id : null,
        profileImage: user.ProfileImage ? user.ProfileImage.name : null,
        profileImageId: user.ProfileImage ? user.ProfileImage.id : null,
        country: user.Country ? user.Country.name : null,
        city: user.City ? user.City.name : null,
        countryId: user.Country ? user.Country.id : null,
        cityId: user.City ? user.City.id : null,
        gender: user.gender,
        birthday: user.birthday
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




const createDefaultRolesAndOwner = async () => {
  try {
    await sequelize.sync();

    // 1. Krijo rolet
    const roles = ['Client', 'Fizioterapeut', 'Nutricionist', 'Trajner', 'Psikolog'];
    for (let roleName of roles) {
      const [role, created] = await Role.findOrCreate({ 
        where: { name: roleName } 
      });
      if (created) {
        await RoleMongo.create({ mysqlId: role.id.toString(), name: roleName });
        console.log(`Roli '${roleName}' u krijua në MySQL & MongoDB.`);
      }
    }

    const clientRole = await Role.findOne({ where: { name: 'Client' } });
    if (!clientRole) {
      throw new Error('Client role nuk ekziston në MySQL!');
    }

    const clientRoleMongo = await RoleMongo.findOne({ name: 'Client' });
    if (!clientRoleMongo) {
      throw new Error('Client role nuk ekziston në MongoDB!');
    }

    // 2. Krijo rolet e Dashboard
    const dashboardRoles = ['Owner'];
    for (let roleName of dashboardRoles) {
      const [dashboardRole, created] = await DashboardRole.findOrCreate({ 
        where: { name: roleName } 
      });
      if (created) {
        await DashboardRoleMongo.create({ 
          mysqlId: dashboardRole.id.toString(), 
          name: roleName 
        });
        console.log(`Roli i Dashboard '${roleName}' u krijua në MySQL & MongoDB.`);
      }
    }

    const ownerDashboardRole = await DashboardRole.findOne({ 
      where: { name: 'Owner' } 
    });
    if (!ownerDashboardRole) {
      throw new Error('Owner role nuk ekziston!');
    }

    // 3. Krijo përdoruesin Owner
    const existingOwner = await User.findOne({ 
      where: { email: 'owner@gmail.com' } 
    });

    if (!existingOwner) {
      const randomPassword = 'owner';
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newOwner = await User.create({
        username: 'owner',
        email: 'owner@gmail.com',
        password: hashedPassword,
        dashboardRoleId: ownerDashboardRole.id,
        name: 'owner',
        lastName: 'Account',
        roleId: clientRole.id,
        number: '123456789'
      });

      await UserMongo.create({
        mysqlId: newOwner.id.toString(),
        username: 'owner',
        email: 'owner@gmail.com',
        dashboardRole: 'Owner',
        name: 'Owner',
        password: hashedPassword,
        lastName: 'Account',
        number: '123456789',
        roleId: clientRoleMongo._id
      });

      console.log('Owner user u krijua me sukses në të dyja databazat!');
    } else {
      console.log('Owner user ekziston tashmë në MySQL.');

      const existingOwnerMongo = await UserMongo.findOne({ 
        mysqlId: existingOwner.id.toString() 
      });
      if (!existingOwnerMongo) {
        await UserMongo.create({
          mysqlId: existingOwner.id.toString(),
          username: 'owner',
          email: 'owner@gmail.com',
          dashboardRole: 'Owner',
          name: 'Owner',
          lastName: 'Account'
        });
        console.log('Owner user u shtua në MongoDB (ekzistonte vetëm në MySQL).');
      }
    }
  } catch (err) {
    console.error("Gabim gjatë krijimit të owner user:", err);
  }
};


createDefaultRolesAndOwner();



// const RoleMongo = require('./infrastructure/database/models/Mongo/RoleMongo');

// app.get('/user', isAuthenticated, async (req, res) => {
//   try {
//     const user = await UserMongo.findOne({ mysqlId: req.user.id })
//       .populate('roleId', 'name') 
//       .populate('countryId', 'name') 
//       .populate('cityId', 'name') 
//       .populate({
//         path: 'profileImageId',
//         select: 'name data', 
//       });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({
//       user: {
//         id: user.mysqlId, 
//         name: user.name,
//         lastName: user.lastName,
//         email: user.email,
//         number: user.number,
//         username: user.username,
//         role: user.roleId ? user.roleId.name : 'User',
//         profileImage: user.profileImageId ? user.profileImageId.name : null,
//         profileImageId: user.profileImageId ? user.profileImageId.id : null,
//         country: user.countryId ? user.countryId.name : null,
//         city: user.cityId ? user.cityId.name : null,
//         countryId: user.countryId?._id || null,
//         cityId: user.cityId?._id || null,
//         gender: user.gender,
//         birthday: user.birthday,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



app.get('/', (req, res) => {
  res.json('user');
});


app.post('/refresh', (req, res) => {
  const refreshToken = req.cookies['refreshToken'];

  if (!refreshToken) {
    return res.status(401).json({ error: 'Nuk ka refresh token.' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Refresh token i pavlefshëm.' });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('ubtsecured', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.status(200).json({ accessToken: newAccessToken });
  });
});

app.post('/logout', (req, res) => {
  res.clearCookie('ubtsecured', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.status(200).json({ message: 'U çkyçët me sukses.' });
});





app.use(passport.initialize());
app.use(passport.session());


// 




const PORT = 5000;

// sequelize.sync().then(() => {
//   //    console.log('Database synced successfully');
//   app.listen(PORT, () => console.log(`Server: ${PORT} OK`))
// }).catch((err) => console.log(err));

sequelize.sync().then(() => {
  server.listen(PORT, () => console.log(`Server with WebSockets: ${PORT} OK`));
}).catch((err) => console.log(err));

require('dotenv').config();
const express = require('express');
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
const trainingRoutes = require('./routes/TrainingRoutes');
const isAuthenticated = require('./middlewares/authMiddleware').isAuthenticated;

const mongoose = require('mongoose')
const User = require('./infrastructure/database/models/User');
const Country = require('./infrastructure/database/models/Country');
const City = require('./infrastructure/database/models/City');
const ProfileImage = require('./infrastructure/database/models/ProfileImage');





//

const app = express();

// TrainingRoutes
app.use('/api/trainings', trainingRoutes);

// Middleware setup
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", "http://192.168.0.109:3000"],
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



app.get('/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role },
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
        role: user.Role ? user.Role.name : 'User',
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

const UserMongo = require('./infrastructure/database/models/UserMongo');
const CountryMongo = require('./infrastructure/database/models/CountryMongo');
const CityMongo = require('./infrastructure/database/models/CityMongo');
const ProfileImageMongo = require('./infrastructure/database/models/ProfileImageMongo');
// const RoleMongo = require('./infrastructure/database/models/RoleMongo');

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

const Role = require('./infrastructure/database/models/Role');
const RoleMongo = require('./infrastructure/database/models/RoleMongo');
const DashboardRole = require('./infrastructure/database/models/DashboardRole');
const DashboardRoleMongo = require('./infrastructure/database/models/DashboardRoleMongo');

const createDefaultRoles = async () => {
  try {
    await sequelize.sync(); 

    // Rolet e zakonshme
    const roles = ['Client', 'Fizioterapeut', 'Nutricionist', 'Trajner', 'Psikolog'];

    for (let roleName of roles) {
      // Create or find the role in MySQL
      const [role, created] = await Role.findOrCreate({
        where: { name: roleName },
        defaults: { name: roleName },
      });

      if (created) {
        await RoleMongo.create({
          mysqlId: role.id.toString(),
          name: roleName,
        });
        console.log(`Roli '${roleName}' u krijua në të dyja databazat.`);
      } else {
        const existingMongoRole = await RoleMongo.findOne({ mysqlId: role.id.toString() });
        if (!existingMongoRole) {
          await RoleMongo.create({
            mysqlId: role.id.toString(),
            name: roleName,
          });
          console.log(`Roli '${roleName}' u krijua në MongoDB (ekzistonte vetëm në MySQL).`);
        }
      }
    }

    // Rolet e Dashboard-it
    const dashboardRoles = ['Admin', 'Owner'];

    for (let roleName of dashboardRoles) {
      // Create or find the role in MySQL
      const [dashboardRole, created] = await DashboardRole.findOrCreate({
        where: { name: roleName },
        defaults: { name: roleName },
      });

      if (created) {
        await DashboardRoleMongo.create({
          mysqlId: dashboardRole.id.toString(),
          name: roleName,
        });
        console.log(`Roli i Dashboard '${roleName}' u krijua në të dyja databazat.`);
      } else {
        const existingMongoDashboardRole = await DashboardRoleMongo.findOne({ 
          mysqlId: dashboardRole.id.toString() 
        });
        if (!existingMongoDashboardRole) {
          await DashboardRoleMongo.create({
            mysqlId: dashboardRole.id.toString(),
            name: roleName,
          });
          console.log(`Roli i Dashboard '${roleName}' u krijua në MongoDB (ekzistonte vetëm në MySQL).`);
        }
      }
    }
  } catch (err) {
    console.error("Gabim gjatë krijimit të rolave:", err);
  }
};

createDefaultRoles();


app.use(passport.initialize());
app.use(passport.session());


// 




const PORT = 5000;

sequelize.sync().then(() => {
//    console.log('Database synced successfully');
    app.listen(PORT, () => console.log(`Server: ${PORT} OK`))
}).catch((err) => console.log(err));




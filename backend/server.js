
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
const User = require('./infrastructure/database/models/User');
const fs = require('fs');
const path = require('path');
const sequelize = require('./config/database');

const mongoose = require('mongoose')
const trainingRoutes = require('./routes/TrainingRoutes');


//

const app = express();

// TrainingRoutes
app.use('/api/trainings', trainingRoutes);

// Middleware setup
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
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

const isAuthenticated = (req, res, next) => {
    const token = req.cookies['ubtsecured'];
    if (!token) {
      return res.status(401).json({ error: 'Kërkohet autentifikimi.' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'supersecret', { ignoreExpiration: false }, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token i pavlefshëm.' });
      }
      req.user = user;
      next();
    });
};

app.get('/user', isAuthenticated, (req, res) => {
    res.json({ user: req.user });
});






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
const RoleMongo = require('./infrastructure/database/models/RoleMongo')

const createDefaultRoles = async () => {
  try {
    await sequelize.sync(); 

    const roles = ['User', 'Admin', 'Fizioterapeut', 'Nutricionist', 'Trajner', 'Psikolog'];

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



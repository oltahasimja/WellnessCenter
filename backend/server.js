
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const mongoose = require('mongoose')

//

const app = express();



app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.options('*', cors());

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));




const PORT = 5000;

sequelize.sync().then(() => {
//    console.log('Database synced successfully');
    app.listen(PORT, () => console.log(`Server: ${PORT} OK`))
}).catch((err) => console.log(err));

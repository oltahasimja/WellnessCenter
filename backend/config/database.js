require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const { FORCE } = require('sequelize/lib/index-hints');
const mongoose = require('mongoose');


const createDatabaseIfNotExists = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

     await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
     await connection.end();
};

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    // port:process.env.PORT,
    logging: false,
    // dialectOptions: {
    //     ssl: {
    //         rejectUnauthorized: false, 
    //       },

    // }
});

(async () => {
    try {
        await createDatabaseIfNotExists();

        await sequelize.authenticate();
        console.log('DB OK');

        // Sync all models that are not already in the database
        // await sequelize.sync({ force: true });
        await sequelize.sync();

        console.log('Tables OK');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
    }
})();



mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


// syncMySQLToMongoDB();



module.exports = sequelize;
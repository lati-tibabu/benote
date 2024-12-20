'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

require("dotenv").config();

const DB_DIALECT = 'postgres';

const db = {};

// if remote database is used comment this one, cofigure information in your .env with correct credentials to use it

// const sequelize = new Sequelize(
//   process.env.DB_DATABASE,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//    host: process.env.DB_HOST,
//    dialect: DB_DIALECT,
//    port: process.env.DB_PORT, 
//    logging: false
//   }
// );

// if remote database is used uncomment this one else comment this part, do not cofigure information in your .env

const sequelize = new Sequelize(
  process.env.REMOTE_DATABASE,
  process.env.REMOTE_USER,
  process.env.REMOTE_PASSWORD,
  {
   host: process.env.REMOTE_HOST,
   dialect: DB_DIALECT,
   port: process.env.REMOTE_PORT,
   dialectOptions: {
    ssl: {
      require: true,
      // rejectUnauthorized: false, // Allow self-signed certificates
      ca: fs.readFileSync('../backend/certficates/ca.pem')
    }
   }
  }
);


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
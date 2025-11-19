"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const dotenv = require("dotenv");
const caCertPath = path.join(__dirname, "../certificates/ca.pem");

// Load environment variables from .env file
dotenv.config();
require("pg");

// Constants
const DB_DIALECT = "postgres";
const caCert = fs.readFileSync(caCertPath); // Read CA certificate

// Determine the current environment
const environment = process.env.NODE_ENV || "dev";

// Helper function to create Sequelize instance
function createSequelizeInstance(config) {
  return new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: DB_DIALECT,
    port: config.port,
    logging: false,
    dialectOptions: config.ssl
      ? {
          ssl: {
            rejectUnauthorized: false, // Allow self-signed certificates
            ca: caCert, // Use the CA certificate
          },
        }
      : {},
  });
}

// Database configuration based on environment
let sequelize;
if (environment === "dev" || environment === "development" || environment === "staging" || environment === "test") {
  sequelize = createSequelizeInstance({
    database: process.env.DB_DATABASE,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    ssl: false, // No SSL for local development
  });
} else {
  sequelize = createSequelizeInstance({
    database: process.env.REMOTE_DATABASE,
    username: process.env.REMOTE_USER,
    password: process.env.REMOTE_PASSWORD,
    host: process.env.REMOTE_HOST,
    port: process.env.REMOTE_PORT,
    ssl: true, // Enable SSL for remote connections
  });
}

// Initialize models
const db = {};
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && // Ignore hidden files
      file !== path.basename(__filename) && // Ignore this file
      file.slice(-3) === ".js" && // Only include JavaScript files
      file.indexOf(".test.js") === -1 // Exclude test files
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

// Associate models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

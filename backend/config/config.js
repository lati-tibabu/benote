require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || 'benote_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || 'benote_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    username: process.env.REMOTE_USER || process.env.DB_USER,
    password: process.env.REMOTE_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.REMOTE_DATABASE || process.env.DB_DATABASE,
    host: process.env.REMOTE_HOST || process.env.DB_HOST,
    dialect: 'postgres',
  },
};

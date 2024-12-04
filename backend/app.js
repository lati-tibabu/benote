const express = require('express');
const app = express();
const sequelize = require('./models').sequelize;

app.get('/', (req, res) => {
  res.send('Hello from the productivity hub!');
});

app.get('/database', (req, res) => {
  sequelize.sync({alter: true})
  .then(() => {
    res.status(201).send('Database synced');
  })
  .catch(err => {
    res.status(501).send('Error syncing database: ', err);
    console.error('Error syncing', err);
  })
});

module.exports = app;
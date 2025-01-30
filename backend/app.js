const express = require('express');
const app = express();
const sequelize = require('./models').sequelize;
const routes = require('./routes');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Hello from the productivity hub backend!');
});

app.get('/database', (req, res) => {
  sequelize.sync({alter: true})
  .then(() => {
    res.status(201).send('Database synced');
  })
  .catch(err => {
    res.status(501).send(`Error syncing database: ${err}`);
    console.error('Error syncing', err);
  })
});

module.exports = app;
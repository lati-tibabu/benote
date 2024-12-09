const express = require('express');
const app = express();
const sequelize = require('./models').sequelize;
const routes = require('./routes');

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Hello from the productivity hub!');
});

app.get('/database', (req, res) => {
  sequelize.sync({force: true})
  .then(() => {
    res.status(201).send('Database synced');
  })
  .catch(err => {
    res.status(501).send(`Error syncing database: ${err}`);
    console.error('Error syncing', err);
  })
});

module.exports = app;
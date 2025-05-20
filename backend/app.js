const express = require("express");
const app = express();
const sequelize = require("./models").sequelize;
const routes = require("./routes");
const cors = require("cors");
const passport = require("./middlewares/passport");
// const path = require("path");

app.use(passport.initialize());
app.use(express.json());
app.use(cors());

// Serve static files from the 'uploads' directory
// app.use("/uploads", express.static("uploads"));
// app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use("/api", routes); // in app.js or server.js

app.get("/", (req, res) => {
  res.send("Hello from the productivity hub backend!");
});

app.get("/database", (req, res) => {
  sequelize
    .sync({ force: true })
    .then(() => {
      res.status(201).send("Database synced");
    })
    .catch((err) => {
      res.status(501).send(`Error syncing database: ${err}`);
      console.error("Error syncing", err);
    });
});

module.exports = app;

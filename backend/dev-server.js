require("dotenv").config();

const { sequelize } = require("./models");

async function startDevServer() {
  try {
    await sequelize.sync({ alter: false });
    console.log("Database synced for dev mode (alter: false).");
    require("./server");
  } catch (error) {
    console.error("Failed to sync database in dev mode:", error);
    process.exit(1);
  }
}

startDevServer();

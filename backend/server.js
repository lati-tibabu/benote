require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

const port = process.env.PORT || 3060;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const users = new Map();

// Export these to use in other modules
module.exports.io = io;
module.exports.users = users;

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Register user socket
  socket.on("register", (userId) => {
    users.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });

  // Join team chat room
  socket.on("teamDiscussionRegister", (teamId) => {
    socket.join(teamId);
    console.log(`${socket.id} joined team ${teamId}`);
  });

  // Handle discussion message
  socket.on("discussionMessage", (message, teamId) => {
    io.to(teamId).emit("message", { from: socket.id, message });
  });

  // Clean up on disconnect
  socket.on("disconnect", () => {
    for (const [userId, id] of users.entries()) {
      if (id === socket.id) {
        users.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

require("./cron/notificationCron");

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

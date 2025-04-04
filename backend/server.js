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

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("register", (userId) => {
    users.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });

  socket.on("teamDiscussionRegister", (teamId) => {
    socket.join(teamId);
    console.log(`${socket.id} joined team ${teamId}`);
  });

  socket.on("discussionMessage", (message, teamId) => {
    io.to(teamId).emit("message", { from: socket.id, message });
  });

  socket.on("disconnect", () => {
    for (const teamId of socket.rooms) {
      socket.leave(teamId);
    }

    for (const [userId, id] of users.entries()) {
      if (id === socket.id) {
        users.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

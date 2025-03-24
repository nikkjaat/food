const { Server } = require("socket.io");

const InitializeSocketIO = (server) => {
  if (!server) {
    console.error("❌ ERROR: Server instance is undefined.");
    return null;
  }

  let io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    socket.on("joinRoom", (roomName) => {
      socket.join(roomName);
      console.log(`📢 Client joined room: ${roomName}`);
    });

    socket.on("sendMessage", (message) => {
      io.to(message.room).emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io; // ✅ Now we return io
};

module.exports = InitializeSocketIO;

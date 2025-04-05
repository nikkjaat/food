require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const http = require("http");

const InitializeSocketIO = require("./Socketio.js/Socket");
const corsOptions = require("./config/corsOptions");
const mongoConnect = require("./utils/database");

const userRoute = require("./Routes/user");
const shopRoutes = require("./Routes/Shop");
const adminRoutes = require("./Routes/Admin");
const paymentRoutes = require("./Routes/Payment");

const app = express();

// ✅ Load PORT and HOST from environment variables
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0"; // allows access from other devices on same network

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = InitializeSocketIO(server);

// ✅ Store io globally
global.io = io;

// ✅ Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);
app.use(shopRoutes);
app.use(userRoute);

// ✅ Static files
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
);

// ✅ Catch-all route
app.get("*", (req, res) => {
  res.send("Page Not Found");
});

// ✅ Connect to DB then start server
mongoConnect()
  .then(() => {
    server.listen(PORT, HOST, () => {
      console.log(`✅ Backend is running at http://${HOST}:${PORT}`);
      console.log(
        "✅ global.io is now set:",
        global.io ? "Available ✅" : "❌ Undefined"
      );
    });
  })
  .catch((err) => console.log(err));

module.exports = { io, server };

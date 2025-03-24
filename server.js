require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const http = require("http");
const InitializeSocketIO = require("./Socketio.js/Socket");

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = require("./config/corsOptions");

// Create HTTP server
const server = http.createServer(app);

// ✅ Initialize socket.io
const io = InitializeSocketIO(server);

// ✅ Store io instance globally (important)
global.io = io;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const userRoute = require("./Routes/user");
const shopRoutes = require("./Routes/Shop");
const adminRoutes = require("./Routes/Admin");
const paymentRoutes = require("./Routes/Payment");

app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);
app.use(shopRoutes);
app.use(userRoute);

// Static Files
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
);

app.get("*", (req, res) => {
  res.send("Page Not Found");
});

// Start Server After MongoDB Connects
const mongoConnect = require("./utils/database");

mongoConnect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Backend is listening on Port ${PORT}`);
      console.log(
        "✅ global.io is now set:",
        global.io ? "Available ✅" : "❌ Undefined"
      );
    });
  })
  .catch((err) => console.log(err));

module.exports = { io, server };

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = require("./config/corsOptions");

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(bodyParser.raw({ type: "application/json" }));

// MongoDB Connection
const mongoConnect = require("./utils/database");

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

// Connect to MongoDB and start the server
mongoConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend is listening on Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

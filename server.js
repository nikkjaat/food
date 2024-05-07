require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 4000

//CORS POLICY
const cors = require("cors");
const corsOptions = require("./config/corsOptions");

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//MONGODB CONNECTION
const mongoConnect = require("./utils/database");

// ROUTES
const userRoute = require("./Routes/user");
const shopRoutes = require("./Routes/Shop");
const adminRoutes = require("./Routes/Admin");
const paymentRoutes = require("./Routes/Payment");
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);
app.use(shopRoutes);
app.use(userRoute);

const path = require("path");

//USER MODEL
const user = require("./models/User");

app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
);

app.get("*", (req, res, next) => {
  res.send("Page Not Found");
});

mongoConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend is listening on Port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

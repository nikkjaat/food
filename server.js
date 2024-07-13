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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.raw({ type: "application/json" }));

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

// Webhook Endpoint
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed: ${err.message}`);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Update your database here with the payment information
      break;
    case "checkout.session.completed":
      const session = event.data.object;
      console.log(
        `Checkout session for ${session.amount_total} was successful!`
      );
      // Update your database here with the session information
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

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

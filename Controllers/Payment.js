const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");

exports.postCheckout = async (req, res, next) => {
  const addressId = req.body.addressId;

  const user = await req.user.populate("cart.productId");
  const products = user.cart;
  let total = 0;
  products.forEach((p) => (total += p.quantity * p.productId.price));
  const customer = await stripe.customers.create({
    metadata: {
      addressId: addressId,
      userId: req.user._id.toString(),
    },
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "INR",
      description: "Payment for purchase from Stripe",
      customer: customer.id,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

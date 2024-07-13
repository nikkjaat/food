// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const User = require("../models/User");

// exports.postCheckout = async (req, res, next) => {
// const addressId = req.body.addressId;
// const user = await req.user.populate("cart.productId");
// console.log(user, addressId);
// const products = user.cart;
// let total = 0;
// products.forEach((p) => (total += p.quantity * p.productId.price));
// // Fetch user address from your database or req.body
// const address = user.address.find(
//   (addr) => addr._id.toString() === addressId
// );
// if (!address) {
//   return res.status(400).json({ message: "Address not found" });
// }
// const customer = await stripe.customers.create({
//   name: `${user.firstName} ${user.lastName}`, // Assuming you have firstName and lastName in your user model
//   email: user.email, // Assuming you have email in your user model
//   address: {
//     line1: address.line1,
//     line2: address.line2,
//     city: address.city,
//     state: address.state,
//     postal_code: address.postalCode,
//     country: address.country,
//   },
//   metadata: {
//     addressId: addressId,
//     userId: req.user._id.toString(),
//   },
// });
// try {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: total * 100, // Convert to smallest currency unit (cents, paise, etc.)
//     currency: "INR",
//     description: "Payment for purchase from Stripe",
//     customer: customer.id,
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });
//   res.send({
//     clientSecret: paymentIntent.client_secret,
//   });
// } catch (err) {
//   res.status(500).json({ message: err.message });
// }
// };

const Product = require("../models/Product");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.postCheckout = async (req, res) => {
  const { addressId, productId, userId, quantity } = req.body;

  console.log(addressId);
  try {
    const product = await Product.findById(productId);
    // console.log(product);

    const user = await User.findById(userId);
    const address = await user.getSingleAddress(addressId);

    const price = await stripe.prices.create({
      unit_amount: product.price * 100,
      currency: "INR",
      product_data: {
        name: product.name,
      },
    });

    const customer = await stripe.customers.create({
      name: address.name,
      email: user.email,
      address: {
        line1: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.pincode,
        country: "IN",
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: quantity,
        },
      ],
      customer: customer.id,
      mode: "payment",
      success_url: process.env.FRONTEND_URL,
      cancel_url: `http://localhost:3000/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

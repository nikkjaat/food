// const Order = require("../models/Order");
// const Product = require("../models/Product");
// const User = require("../models/User");
// // const Order = require("../models/Order");
// const Address = require("../models/Address");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// exports.postCheckout = async (req, res) => {
//   const { addressId, productId, userId, quantity, shippingCost } = req.body;
//   try {
//     const product = await Product.findById(productId);
//     // console.log(product);

//     const user = await User.findById(userId);
//     const address = await Address.findById(addressId);

//     const price = await stripe.prices.create({
//       unit_amount: product.price * 100,
//       currency: "INR",
//       product_data: {
//         name: product.name,
//       },
//     });

//     const customer = await stripe.customers.create({
//       name: address.name,
//       email: user.email,
//       address: {
//         line1: address.street,
//         city: address.city,
//         state: address.state,
//         postal_code: address.pincode,
//         country: "IN",
//       },
//     });

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price: price.id,
//           quantity: quantity,
//         },
//       ],
//       customer: customer.id,
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment/success?id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `http://localhost:3000/`,

//       metadata: {
//         userId: userId,
//         addressId: addressId,
//         productId: productId,
//         quantity: quantity,
//       },
//     });
//     res.json({ url: session.url });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.session = async (req, res, next) => {
//   const sessionId = req.query.id;
//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     const { userId, addressId, productId, quantity } = session.metadata;

//     if (!userId || !productId || !addressId || !quantity) {
//       return res.status(422).json({ message: "Missing required IDs" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // ✅ Check if the same order exists within the last 10 seconds
//     const existingOrder = await Order.findOne({ sessionId });

//     if (existingOrder) {
//       return res.status(201).json({ message: "Duplicate order detected" });
//     }

//     // ✅ Save the new order if it's not a duplicate
//     const order = await Order.create({
//       productId,
//       addressId,
//       quantity: parseInt(quantity),
//       orderDate: new Date(),
//       userId,
//       sessionId,
//       status: "Pending",
//     });

//     await order.save(); // Saves the document in MongoDB

//     // console.log(order);

//     req.user.myOrder.push({
//       orderId: order._id, // Store the order ID for tracking
//       productId: productId,
//     });

//     req.user.save();
//     res.status(200).json({ message: "Order stored successfully", session });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Address = require("../models/Address");
require("dotenv").config();
const fetch = require("node-fetch"); // Ensure node-fetch is installed

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const BASE_URL = "https://sandbox.cashfree.com/pg/orders"; // Use production URL for live payments

// console.log(APP_ID, SECRET_KEY);

// ✅ Create Payment Link
exports.postCheckout = async (req, res) => {
  const { addressId, productId, userId, quantity, amount } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = await Address.findById(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // const totalAmount = product.price * quantity + shippingCost;
    const orderId = `order_${Date.now()}`;

    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      order_note: "Product Purchase",
      customer_details: {
        customer_id: userId,
        customer_email: user.email,
        customer_phone: user.phone || "9999999999",
        customer_name: user.name,
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
      },
      order_tags: {
        address_id: addressId,
        product_id: productId,
        quantity: JSON.stringify(quantity),
      },
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
      },
      body: JSON.stringify(orderData),
    });

    const responseData = await response.json();

    if (responseData.payment_session_id) {
      res.json({
        sessionId: responseData.payment_session_id,
        orderId: responseData.order_id,
      });
    } else {
      res.status(500).json({
        error: "Failed to create payment session",
        details: responseData,
      });
    }
  } catch (error) {
    console.error("Cashfree Order Error:", error.message);
    res.status(500).json({ error: "Payment processing failed" });
  }
};

// ✅ Verify Payment and Store Order
exports.session = async (req, res) => {
  const { order_id } = req.query;

  try {
    const response = await fetch(`${BASE_URL}/${order_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
      },
    });

    const paymentData = await response.json();

    // console.log(paymentData);

    if (paymentData.order_status !== "PAID") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // const { userId, addressId, productId, quantity } = paymentData.order_meta;

    const userId = paymentData.customer_details.customer_id;
    const addressId = paymentData.order_tags.address_id;
    const productId = paymentData.order_tags.product_id;
    const quantity = paymentData.order_tags.quantity;

    // console.log(userId, addressId, productId, quantity);

    if (!userId || !productId || !addressId || !quantity) {
      return res.status(422).json({ message: "Missing required fields" });
    }

    const existingOrder = await Order.findOne({
      orderId: paymentData.order_id,
    });
    if (existingOrder)
      return res.status(201).json({ message: "Duplicate order detected" });

    const order = await Order.create({
      productId,
      addressId,
      quantity: parseInt(quantity),
      orderDate: new Date(),
      userId,
      orderId: paymentData.order_id,
      status: paymentData.order_status,
    });

    await order.save();

    req.user.myOrder.push({
      orderId: order._id, // Store the order ID for tracking
      productId: productId,
    });

    req.user.save();

    res.status(200).json({ message: "Order stored successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

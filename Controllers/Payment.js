const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Address = require("../models/Address");
require("dotenv").config();
const fetch = require("node-fetch"); // Ensure node-fetch is installed
const { io } = require("../server");

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
  console.log("🔹 io instance in Payment.js:", global.io); // Debug log

  if (!global.io) {
    console.error("❌ ERROR: io is undefined. Check server.js export.");
    return res.status(500).json({ error: "Internal server error" });
  }

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

    if (paymentData.order_status !== "PAID") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const userId = paymentData.customer_details?.customer_id;
    const addressId = paymentData.order_tags?.address_id;
    const productId = paymentData.order_tags?.product_id;
    const quantity = paymentData.order_tags?.quantity;

    if (!userId || !productId || !addressId || !quantity) {
      return res.status(422).json({ message: "Missing required fields" });
    }

    const existingOrder = await Order.findOne({
      orderId: paymentData.order_id,
    });
    if (existingOrder) {
      return res.status(201).json({ message: "Duplicate order detected" });
    }

    const order = await Order.create({
      productId,
      addressId,
      quantity: parseInt(quantity),
      orderDate: new Date(),
      userId,
      orderId: paymentData.order_id,
      paymentStatus: paymentData.order_status,
    });

    await order.save();

    if (req.user) {
      req.user.myOrder.push({
        orderId: order._id,
        productId: productId,
      });

      await req.user.save();
    }

    const product = await Product.findById(productId);

    await User.findByIdAndUpdate(product.userId, {
      $push: { getNewOrder: { order: order._id } },
    });

    // ✅ Emit event using global.io
    const populatedOrder = await Order.findById(order._id)
      .populate("productId")
      .populate("addressId")
      .populate("userId")
      .exec();

    if (global.io) {
      global.io.emit("newOrder", populatedOrder);
      // console.log("✅ Emitted newOrder event:", populatedOrder);
    } else {
      console.error("❌ ERROR: io instance is still undefined");
    }

    res.status(200).json({ message: "Order stored successfully", order });

  } catch (error) {
    console.error("❌ Payment Verification Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

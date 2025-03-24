const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    ref: "food_items",
  },
  addressId: {
    type: String,
    required: true,
    ref: "address",
  },
  quantity: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  totalPrice: {
    type: Number,
  },
  paymentStatus: {
    type: String,
    default: "Pending",
  },
  userId: {
    type: String,
    ref: "user",
  },
  orderId: {
    type: String,
    required: true,
  },
  orderStatus: {
    type: String,
    default: "Pending",
    required: true,
  },
});

module.exports = mongoose.model("order", OrderSchema);

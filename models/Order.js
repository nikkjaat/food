const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  addressId: {
    type: String,
    required: true,
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
  status: {
    type: String,
    default: "Pending",
  },
  userId: {
    type: String,
  },
  orderId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("order", OrderSchema);

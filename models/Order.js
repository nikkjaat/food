const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("order", OrderSchema);

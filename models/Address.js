const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  houseNo: {
    type: Number,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  contactNo: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("address", AddressSchema);

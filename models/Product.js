const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const ProductSchema = new Schema(
  {
    userId: { type: "String" },
    categoryName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    imgURL: {
      type: String,
      required: true,
    },

    description: String,

    shippingCost: {
      type: Number,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("food_items", ProductSchema);

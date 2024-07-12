const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: Array,
    default: "customer",
  },
  cart: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "food_items",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  myProduct: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "food_items",
      },
    },
  ],
  address: [
    {
      name: { type: String, required: true },
      houseNo: { type: Number, required: true },
      street: { type: String, required: true },
      pincode: { type: Number, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      contactNo: { type: Number, required: true },
    },
  ],
  profilePicture: {
    type: String,
    default: "",
  },
  defaultAddress: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  resetToken: String,
  resetTokenExpiration: String,
});

UserSchema.methods.addToCart = async function (productId) {
  // console.log(productId);
  let newQuantity = 1;
  const updatedCart = this.cart;
  console.log(updatedCart);

  const existingProduct = updatedCart.findIndex(
    (product) => product.productId.toString() === productId
  );

  // console.log(existingProduct);

  if (existingProduct >= 0) {
    updatedCart[existingProduct].quantity += 1;
  } else {
    updatedCart.push({ productId, quantity: newQuantity });
  }

  this.cart = updatedCart;
  return this.save();
};

UserSchema.methods.updateCart = async function (productId, changeQty) {
  const updatedCart = this.cart;
  const existingProductIndex = updatedCart.findIndex(
    (product) => product.productId.toString() === productId
  );

  updatedCart[existingProductIndex].quantity += parseInt(changeQty);

  if (updatedCart[existingProductIndex].quantity === 0) {
    updatedCart.splice(existingProductIndex, 1);
  }
  this.cart = updatedCart;
  return this.save();
};

UserSchema.methods.getAdminProducts = async function (productId) {
  let myProduct = this.myProduct;

  const existProduct = myProduct.findIndex(
    (product) => product.productId.toString() === productId
  );

  if (existProduct < 0) {
    myProduct.push({ productId: productId });
    this.myProduct = myProduct;
    return this.save();
  }
};

UserSchema.methods.getSingleAddress = async function (addressId) {
  // console.log(addressId);
  let updatedAddress = this.address;
  const existingAddress = updatedAddress.findIndex(
    (address) => address._id.toString() === addressId
  );

  return updatedAddress[existingAddress];
};

UserSchema.methods.updateAddress = async function (addressId, updatedData) {
  let updatedAddress = this.address;

  const existingAddress = updatedAddress.findIndex(
    (address) => address._id.toString() === addressId
  );

  if (existingAddress >= 0) {
    updatedAddress[existingAddress] = updatedData;
  }

  this.address = updatedAddress;
  return this.save();
};

module.exports = mongoose.model("user", UserSchema);

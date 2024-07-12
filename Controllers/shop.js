const Product = require("../models/Product");

exports.getFood = async (req, res, next) => {
  try {
    const products = await Product.find({}).lean();

    if (products.length > 0) {
      return res.status(200).json({ products: products });
    }
    res.status(204).json({ message: "No products found", products: [] });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

exports.addToCart = async (req, res, next) => {
  const productId = req.params.prodId;

  try {
    await req.user.addToCart(productId);
    res.status(200).json({ message: "Product Added to Cart", id: productId });
  } catch (error) {
    res.status(500).json({ message: "Internal Server ", error });
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.productId");
    if (user.cart.length === 0) {
      return res
        .status(200)
        .json({ message: "Cart is empty", data: [], user: user });
    }
    return res
      .status(200)
      .json({ message: "Cart Items", data: user.cart, user: user });
  } catch (err) {
    res.status(200).json({ message: err });
  }
};

exports.updateCart = async (req, res, next) => {
  const { changeQty, productId } = req.query;
  try {
    await req.user.updateCart(productId, changeQty);
    res.status(200).json({ message: "Product Quantity changed" });
  } catch (err) {
    res.status(200).json({ message: err });
  }
};

exports.deleteCartItem = async (req, res, next) => {
  const productId = req.query.productId;

  try {
    req.user.cart.pull({ productId: productId });
    await req.user.save();
    res.status(200).json({ message: "Item Deleted form Cart" });
  } catch (err) {
    res.status(500).json({ message: "err" });
  }
};

exports.addAddress = async (req, res, next) => {
  const address = req.body;
  if (
    !address?.name ||
    !address?.houseNo ||
    !address?.street ||
    !address?.city ||
    !address?.state ||
    !address?.pincode ||
    !address?.contactNo ||
    !address?.country
  ) {
    return res.status(422).json({ message: "All Fields are Mandatory" });
  }
  try {
    req.user.address.push(address);
    await req.user.save();
    res.status(200).json({ message: "Address added Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAddress = async (req, res, next) => {
  const address = req.user.address;
  try {
    if (address.length === 0) {
      return res.status(200).json({ message: "No Address Found!", data: [] });
    }
    res
      .status(200)
      .json({
        message: "Address fetch Successfully",
        data: address,
        defaultAddress: req.user.defaultAddress,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSingleAddress = async (req, res, next) => {
  const addressId = req.query.addressId;
  try {
    const address = await req.user.getSingleAddress(addressId);
    console.log(address);
    res.status(200).json({ message: "Fetch Single Address", data: address });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.deleteAddress = async (req, res, next) => {
  const prodId = req.query.prodId;

  try {
    req.user.address.pull({ _id: prodId });
    await req.user.save();
    res.status(200).json({ message: "Address removed successfully" });
  } catch {
    res.status(500).json({ message: err });
  }
};
exports.updateAddress = async (req, res, next) => {
  try {
    await req.user.updateAddress(req.query.addressId, req.body);
    res.status(200).json({ message: "Address Updated Successfully" });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.filterProducts = async (req, res, next) => {
  const filterProduct = req.query.filter;
  // console.log(filterProduct);
  // const allProducts = await Product.find({}).lean();
  const products = await Product.find({
    categoryName: { $regex: `${filterProduct}`, $options: "i" },
  });
  if (products != []) {
    return res.status(200).json({ products: products });
  }
};

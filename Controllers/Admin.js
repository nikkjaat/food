const Product = require("../models/Product");
const User = require("../models/User");
const fileDeleteHandler = require("../utils/file-delete");

exports.adminProducts = async (req, res, next) => {
  const products = await Product.find({}).lean();
  if (products.length === 0) {
    return res
      .status(200)
      .json({ message: "No Products Available", products: [] });
  }
  res.status(200).json({ message: "Products Available", products: products });
};

exports.adminAddProducts = async (req, res, next) => {
  // console.log(req.body, req.file, 15);
  try {
    await Product.create({
      categoryName: req.body.categoryName,
      name: req.body.name,
      description: req.body.description,
      imgURL: req.file.path,
      quantity: req.body.quantity,
      price: req.body.price,
      userId: req.user._id.toString(),
    });
    // console.log(req.user._id);

    res.status(200).json({ message: "Success", userId: req.userId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.getAdminProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let products = await Product.find({});
    products.forEach(async (product) => {
      if (product.userId === userId) {
        await req.user.getAdminProducts(product.id);
      }
    });

    const adminProduct = await req.user.populate("myProduct.productId");
    // console.log(adminProduct.myProduct);
    if (adminProduct.myProduct.length <= 0) {
      return res
        .status(200)
        .json({ products: [], message: "No Products Available" });
    }

    res.status(200).json({ products: adminProduct.myProduct, message: true });
  } catch (err) {
    res.status(500).json({ err: err });
  }
};

exports.getSingleProduct = async (req, res, next) => {
  try {
    const prodId = req.query.productId;
    // console.log(prodId);
    const product = await Product.findById(prodId);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.updateProduct = async (req, res, next) => {
  const { categoryName, name, description, quantity, price } = req.body;
  const productId = req.query.productId;

  try {
    const existingProduct = await Product.findById(productId);
    if (req.file) {
      try {
        const result = await fileDeleteHandler(existingProduct.imgURL);
      } catch (err) {
        return res.status(500).json({ message: "Unable to delete File" });
      }
    }
    if (!existingProduct) {
      return res.status(404).json({ message: "Product does not Exist" });
    }

    await Product.findByIdAndUpdate(productId, {
      categoryName,
      imgURL: req.file?.path || existingProduct.imgURL,
      name,
      description,
      quantity,
      price,
    });
    res.status(200).json({ message: "Product Updated Successfully" });
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.prodId;
  try {
    const isExist = await Product.findById(prodId);
    // console.log(isExist);
    if (!isExist) {
      return res.status(404).json({ message: "Product does not exist" });
    }
    await Product.findByIdAndDelete(prodId);
    await User.updateMany(
      { "cart.productId": prodId },
      { $pull: { cart: { productId: prodId } } }
    );
    await User.updateMany(
      { "myProduct.productId": prodId },
      { $pull: { myProduct: { productId: prodId } } }
    );

    res.status(200).json({ message: "Deleted product Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

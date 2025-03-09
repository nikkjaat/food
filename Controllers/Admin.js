const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
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
  try {
    await Product.create({
      categoryName: req.body.categoryName,
      name: req.body.name,
      description: req.body.description,
      imgURL: req.file.path,
      shippingCost: req.body.shippingCost,
      price: req.body.price,
      userId: req.user._id.toString(),
    });

    res.status(200).json({ message: "Success", userId: req.userId });
  } catch (error) {
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

const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      console.log("No image URL provided");
      return null;
    }

    // Extract the public_id from the URL
    const [image_id, extension] = imageUrl.split("/").slice(-1)[0].split(".");

    // Append folder path if applicable
    const fullPublicId = `FoodHub/${image_id}.${extension}`;
    // console.log("Full public_id for deletion:", fullPublicId);

    // Perform the deletion
    const result = await cloudinary.uploader.destroy(fullPublicId);

    // Check and log result
    if (result.result === "ok") {
      console.log("Image successfully deleted");
      return true;
    } else {
      console.log("Failed to delete image. Response:", result);
      return true;
    }
  } catch (error) {
    return false; // Return false in case of any error
  }
};

exports.updateProduct = async (req, res, next) => {
  const { categoryName, name, description, shippingCost, price } = req.body;
  const productId = req.query.productId;
  try {
    const existingProduct = await Product.findById(productId);
    if (req.file) {
      try {
        const result = await deleteCloudinaryImage(existingProduct.imgURL);
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
      shippingCost,
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
    if (!isExist) {
      return res.status(404).json({ message: "Product does not exist" });
    }
    const result = await deleteCloudinaryImage(isExist.imgURL);
    if (!result) {
      return res.status(500).json({ message: "Unable to delete File" });
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

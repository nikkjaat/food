const express = require("express");
const router = express.Router();
const {
  getFood,
  addToCart,
  getCart,
  updateCart,
  deleteCartItem,
  addAddress,
  getAddress,
  deleteAddress,
  updateAddress,
  getSingleAddress,
  filterProducts,
} = require("../Controllers/shop");
const isAuth = require("../Middlewares/isAuth");

router.get("/getfood", getFood);
router.post("/addtocart/:prodId", isAuth, addToCart);
router.get("/getcartitem", isAuth, getCart);
router.patch("/updatecart", isAuth, updateCart);
router.delete("/deletecartitem", isAuth, deleteCartItem);
router.post("/addaddress", isAuth, addAddress);
router.get("/getaddress", isAuth, getAddress);
router.get("/getsingleaddress", isAuth, getSingleAddress);
router.delete("/deleteaddress", isAuth, deleteAddress);
router.patch("/updateaddress", isAuth, updateAddress);
router.get("/filterproducts", filterProducts);

module.exports = router;

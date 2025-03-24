const express = require("express");
const router = express.Router();
const multer = require("multer");

// const upload = multer({ dest: "uploads/" });

const upload = require("../Middlewares/file-upload");

const {
  adminProducts,
  adminAddProducts,
  getAdminProducts,
  getSingleProduct,
  deleteProduct,
  updateProduct,
  getNewOrder,
  setOrderStatus,
} = require("../Controllers/Admin");
const isAuth = require("../Middlewares/isAuth");

router.get("/products", isAuth, adminProducts);
router.post("/addproduct", isAuth, upload.single("imgURL"), adminAddProducts);
router.get("/getproducts", isAuth, getAdminProducts);
router.get("/getsingleproduct", isAuth, getSingleProduct);
router.put("/updateproduct", isAuth, upload.single("imgURL"), updateProduct);
router.delete("/deleteproduct/:prodId", isAuth, deleteProduct);
router.get("/getneworder", isAuth, getNewOrder);
router.post("/setorderstatus", setOrderStatus);

module.exports = router;

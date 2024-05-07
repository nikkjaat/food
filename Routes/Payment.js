const express = require("express");
const router = express.Router();
const isAuth = require("../Middlewares/isAuth");

const { postCheckout } = require("../Controllers/Payment");

router.post("/checkout", isAuth, postCheckout);

module.exports = router;

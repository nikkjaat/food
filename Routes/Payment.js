const express = require("express");
const router = express.Router();
const isAuth = require("../Middlewares/isAuth");

const { postCheckout, session } = require("../Controllers/Payment");

router.post("/create-order", isAuth, postCheckout);
router.get("/session", isAuth, session);

module.exports = router;

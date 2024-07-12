const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { check } = require("express-validator");

const { validate } = require("../Middlewares/expressValidator");
const {
  postSignup,
  getLogin,
  postlogOut,
  updateUserInfo,
  getOTP,
  resetPassword,
  setPassword,
  defaultAddress,
} = require("../Controllers/user");
const isAuth = require("../Middlewares/isAuth");
const upload = require("../Middlewares/file-upload");

router.post(
  "/signup",
  [
    [
      body("email", "Invalid email").isEmail(),
      body("name", "Name validation failed").isLength({ min: 3 }),
      body("password", "Invalid Password length").isLength({ min: 5, max: 12 }),
    ],
  ],
  validate,
  postSignup
);
router.post("/login", getLogin);

router.post("/logout", postlogOut);

router.post("/getotp", getOTP);

router.post("/resetpassword", resetPassword);

router.post("/setpassword", setPassword);
router.put(
  "/updateuserinfo",
  isAuth,
  upload.single("profilePicture"),
  updateUserInfo
);

router.post("/setdefaultaddress", defaultAddress);

module.exports = router;

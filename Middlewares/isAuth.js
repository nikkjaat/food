const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuth = async (req, res, next) => {
  console.log(req.headers);
  if (!req.headers.authorization) {
    return res.status(400).json({ message: "Authorization Required" });
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(401).json({ message: "Not Authorized user" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = isAuth;

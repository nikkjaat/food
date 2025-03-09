const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
// const fileDeleteHandler = require("../utils/file-delete");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_USER_PASSWORD,
  },
});

exports.postSignup = async (req, res, next) => {
  const { name, location, email, password, roles } = req.body;
  //1 Check user exists or not
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(403).json({ message: "User Already Exits" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
  //2 Hashing the password
  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 8);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
  try {
    await User.create({
      name,
      location,
      email,
      password: hashPassword,
      roles,
    });
    res.status(200).json({ success: true, message: "Account Created" });
  } catch (error) {
    res.status(500).json({ message: "internal Server Error", error });
  }
};

exports.getLogin = async (req, res, next) => {
  const { email, password } = req.body;

  //1 Check user exists or not
  const user = await User.findOne({ email });
  try {
    if (!user) {
      return res.status(200).json({ message: "User not exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }

  //2 Check whether the password is correct

  try {
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(200).json({ message: "Invaild email or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }

  const authToken = jwt.sign(
    { userId: user._id, roles: user.roles },
    process.env.JWT_SECRET_KEY
    // {
    //   expiresIn: "1h",
    // }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, roles: user.roles },
    process.env.JWT_REFRESH_TOKEN
    // {
    //   expiresIn: "1d",
    // }
  );

  res.cookie("authtoken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res
    .status(200)
    .json({ success: true, message: "Login Successful", authToken });
};

exports.postlogOut = (req, res, next) => {
  req.session.destroy();

  res.redirect("/");
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
    console.log("Full public_id for deletion:", fullPublicId);

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

exports.updateUserInfo = async (req, res, next) => {
  const _id = req.query.userId;

  const { name, email } = req.body;

  const existingUser = await User.findById(_id);

  if (req.file) {
    try {
      await deleteCloudinaryImage(existingUser.profilePicture);
    } catch (err) {
      return res.status(500).json({ message: "Unable to delete File" });
    }
  }

  if (!existingUser) {
    return res.status(404).json({ message: "User does not Exist" });
  }

  try {
    await User.findByIdAndUpdate(_id, {
      name: name,
      email: email,
      profilePicture: req.file?.path || existingUser.profilePicture,
    });
    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOTP = async (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;
  let user;
  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Account not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  //Create a reset token

  user.resetToken = otp;
  user.resetTokenExpiration = Date.now() + 3600000;
  try {
    await user.save();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  try {
    await transporter.sendMail({
      from: "nikhiljaat330@gmail.com",
      to: email,
      subject: "Reset Password",
      html: `<h1>You have requested for password reset.</h1>
              <p>Your OTP is ${otp}</p>`,
    });
    res.status(200).json({ message: "Successfully Email sent " });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  const email = req.body.email;
  const OTP = req.body.OTP;


  let user;
  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Account not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  try {
    if (user.resetToken == OTP && user.resetTokenExpiration >= Date.now()) {
      res
        .status(200)
        .json({ message: "Reset Password", userId: user._id, otp: OTP });
    } else {
      res.status(401).json({ message: "Token Expire" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.setPassword = async (req, res, next) => {
  const newPassword = req.body.newPassword;
  const userId = req.body.userId;
  const otp = req.body.otp;

  try {
    const user = await User.findOne({
      resetToken: otp,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: "Session Expired" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  //Hashing Password

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 8);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  //to Update the user password
  try {
    const user = await User.findById(userId);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    res.status(200).json({ message: "Successfully Changed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.defaultAddress = async (req, res, next) => {
  const userId = req.query.userId;
  const addressId = req.query.addressId;
  try {
    const user = await User.findById(userId);
    user.defaultAddress = addressId;
    user.save();
    res.status(200).json("Set Default Address");
  } catch (error) {
    res.status(404).json(error);
  }
};

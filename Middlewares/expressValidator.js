const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    let error = errors.array().map((err) => {
      return err.msg;
    });
    return res.status(422).json({
      message: error,
    });
  }
  next();
};

module.exports = { validate };

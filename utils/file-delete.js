const fs = require("fs/promises");

const fileDeleteHandler = async (filePath) => {
  // console.log(filePath);
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    throw err;
  }
};

module.exports = fileDeleteHandler;

const fs = require("fs/promises");

const fileDeleteHandler = async (filePath) => {
  console.log(filePath);
  try {
    if (filePath !== "") {
      await fs.unlink(filePath);
      return true;
    }
    return true;
  } catch (err) {
    throw err;
  }
};

module.exports = fileDeleteHandler;

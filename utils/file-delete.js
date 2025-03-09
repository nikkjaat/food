const fs = require("fs/promises");

const fileDeleteHandler = async (filePath) => {
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

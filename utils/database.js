const mongoose = require("mongoose");

const mongoConnect = async () => {
  await mongoose.connect(process.env.DB_URI);
  console.log("Connected to Database successfully");
  const fetched_data = mongoose.connection.db.collection("food_items");
  fetched_data.find({}).toArray((err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
};

module.exports = mongoConnect;

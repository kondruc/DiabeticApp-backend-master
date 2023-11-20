const mongoose = require("mongoose");

const userMealDateSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  mealDate: {
    type: String,
    default: Date.now(),
  },
});

module.exports = userMealDate = mongoose.model(
  "userMealDateSchema",
  userMealDateSchema
);

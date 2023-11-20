const mongoose = require("mongoose");

const userMealSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userICR: {
    type: String,
    required: true,
    default: 10,
  },
  userCRR: {
    type: String,
    default: 50,
    required: true,
  },
  mealType: {
    type: String,
    enum: ["Breakfast", "Lunch", "Dinner"], // Allowed values: 1 for breakfast, 2 for lunch, 3 for dinner
    required: true,
  },
  mealItems: {
    type: [],
    required: true,
  },
  totalCarbs: {
    type: Number,
    required: true,
  },
  consumedAt: {
    type: Date,
    default: Date.now,
  },
  mealDate: {
    type: String,
    default: Date.now(),
  },
  insulinDose: {
    type: Number,
    required: true,
  },
  bloodGlucoseLevel: {
    type: Number,
  },
  bloodGlucoseLevelBeforeMeal: {
    type: Number,
  },
  bloodGlucoseBefore: {
    type: Number,
  }
});

module.exports = userMeal = mongoose.model("userMealSchema", userMealSchema);

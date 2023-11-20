const userMealSchema = require("../models/userFoodData");
const userMealDateSchema = require("../models/userMealDates");
const userBloodGlucoseSchema = require("../models/userBloodGlucose");



const storeUserData = (req, res) => {
  const {
    userId,
    mealItems,
    totalCarbs,
    mealType,
    insulinDose,
    bloodGlucoseBefore,
    userICR,
    userCRR,
  } = req.body;
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const year = currentDate.getFullYear();
  const mealDate = `${day}/${month}/${year}`;

  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  console.log("Current Time:", formattedTime);

  userMealDateSchema
    .findOne({
      userId,
      mealDate: mealDate,
    })
    .then((existingDate) => {
      if (existingDate) {
        // If mealDate already exists, do not save a new entry
        console.log("MealDate already exists");
        return;
      }
      console.log("New Date ");
      const newUserMealDateSchema = new userMealDateSchema({
        userId,
        mealDate,
      });

      newUserMealDateSchema.save().then((dateSchema) => {
        // Handle successful save
        console.log("New userMealDateSchema saved ");
      });
    });

  const newUserMealSchema = new userMealSchema({
    userId,
    mealItems,
    totalCarbs,
    mealType,
    mealDate,
    insulinDose,
    bloodGlucoseBefore,
    userICR,
    userCRR,
  });

  newUserMealSchema.save().then((mealSchema) => {
    // Handle successful save
    console.log("New userMealSchema saved");
    res.status(200).send("New userMealSchema saved");
  });


// const newUserBloodGlucoseSchema = new userBloodGlucoseSchema({
//   userId,
//   mealDate,
//   mealType,
//   bloodGlucoseBeforeMeal,
// });

// newUserBloodGlucoseSchema.save().then((userBloodSchema) => {

// });

// userBloodGlucoseSchema
//     .findOne({
//       userId: userId,
//       mealDate: mealDate,
//       mealType: mealType,
//       bloodGlucoseBeforeMeal : bloodGlucoseBeforeMeal,
//     })
//     .then((existingDate) => {
//       if (existingDate) {
//         // If mealDate already exists, do not save a new entry
//         console.log("MealDate already exists");
//         return;
//       }
//       console.log("New Date ");
//       const newUserBloodGlucoseSchema = new newUserBloodGlucoseSchema({
//         userId,
//         mealDate,
//         mealType,
//         bloodGlucoseBeforeMeal,
//       });

//       newUserBloodGlucoseSchema.save().then((userBloodSchema) => {
//         // Handle successful save
//         console.log("New user blood glucose saved ");
//       });
//     });
  };
// Calculate new ICR based on historical data
function calculateNewICR(data) {
  const targetBloodGlucose = 100;
  const correctionFactor = 50;

  // Calculate the average correction factor
  const sumCorrectionFactor = data.reduce((sum, entry) => {
    return (
      sum + (entry?.bloodGlucoseLevel - targetBloodGlucose) / entry.userCRR
    );
  }, 0);
  const averageCorrectionFactor = sumCorrectionFactor / data.length;

  // Calculate the new ICR rounded to one decimal place
  const initialICR = 10; // Replace with the user's initial ICR
  console.log("da corr :", data[0].userICR, averageCorrectionFactor);
  const newICR = Number(
    (Number(data[0].userICR) * (1 + averageCorrectionFactor)).toFixed(1)
  );

  return newICR;
}

const updateUserIcr = async (req, res) => {
  try {
    const { userId, mealType } = req.query;

    const query = {
      userId: userId,
      mealType: mealType,
    };

    const options = {
      sort: { timestamp: -1 },
      limit: 7, // Limit the results to 7 entries
    };

    const userBFData = await userMealSchema.find(query, null, options);
    console.log(userBFData);
    const newICR = calculateNewICR(userBFData);
    console.log("New ICr :", newICR);
    res.status(200).json(newICR);
  } catch (error) {
    console.log("Error :", error);
  }
};

const getDataByFoodType_Uid_Date = async (req, res) => {
  try {
    const { userId, mealType } = req.query;
    const currentDate = new Date().toLocaleDateString("en-GB");
    console.log("Find Date :", currentDate);
    const userMeal = await userMealSchema.findOne({
      userId,
      mealType,
      mealDate: { $eq: currentDate },
    });

    if (userMeal) {
      res.status(200).json(userMeal);
    } else {
      res.status(404).json(null);
    }
  } catch (error) {
    console.error("Error fetching user meal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserAllDates = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("user :", userId);
    const userDates = await userMealDateSchema
      .find({
        userId,
      })
      .sort({ mealDate: -1 })
      .limit(7);
    if (userDates.length > 0) {
      res.status(200).json(userDates);
    } else {
      res.status(404).json(null);
    }
  } catch (error) {
    console.error("Error fetching user meal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserDataByDate = async (req, res) => {
  try {
    const { userId, mealDate } = req.query;
    const userMeal = await userMealSchema.find({
      userId,
      mealDate,
    });
    if (userMeal) {
      res.status(200).json(userMeal);
    } else {
      res.status(404).json(null);
    }
  } catch (error) {
    console.error("Error fetching user meal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateByIdAndFoodType = async (req, res) => {
  try {
    const { userId, mealType, mealItems, totalCarbs } = req.body;

    const currentDate = new Date().toLocaleDateString("en-GB");
    console.log("Find Date to Update :", currentDate);

    const updatedUserMeal = await userMealSchema.findOneAndUpdate(
      { userId, mealType, mealDate: { $eq: currentDate } },
      {
        mealItems,
        totalCarbs,
      },
      { new: true }
    );

    if (updatedUserMeal) {
      res.status(200).json(updatedUserMeal);
    } else {
      res
        .status(404)
        .json({ message: "No user meal found for the given criteria." });
    }
  } catch (error) {
    console.error("Error updating user meal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//for adding blood glucose after meal
const addBloodGlucose = async (req, res) => {
  try {
    const { _id, bloodGlucoseLevel } = req.body;

    const updatedUserMeal = await userMealSchema.findOneAndUpdate(
      { _id },
      { bloodGlucoseLevel },
      { new: true }
    );

    if (updatedUserMeal) {
      res.status(200).json(updatedUserMeal);
    } else {
      res
        .status(404)
        .json({ message: "No user meal found for the given criteria." });
    }
  } catch (error) {
    console.error("Error updating user meal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//not using this extra code
const bloodGlucoseBefore = async (req, res) => {
  try {
    const { userId, mealType, bloodGlucoseBefore } = req.body;

    const updatedUserMeal = await userBloodGlucose.findOneAndUpdate(
      { userId, mealType },
      { bloodGlucoseBefore },
      { new: true }
    );

    if (updatedUserMeal) {
      res.status(200).json(updatedUserMeal);
    } else {
      res
        .status(404)
        .json({ message: "No user meal found for the given criteria." });
    }
  } catch (error) {
    console.error("Error updating user meal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//adding blood glucose before meal
const addBloodGlucoseBeforeMeal = async (req, res) => {
  try {
    const { userId, mealType, bloodGlucoseBeforeMeal } = req.body;
    const currentDate = new Date().toLocaleDateString("en-GB");

    const updatedUserMeal = await userBloodGlucoseSchema.findOneAndUpdate(
      { userId,
       mealType,
       mealDate: { $eq: currentDate }},
       { bloodGlucoseBeforeMeal },
       { new: true , upsert: true}
    );

    if (updatedUserMeal) {
      res.status(200).json(updatedUserMeal);
    } else {
      res
        .status(404)
        .json({ message: "No user meal found for the given criteria." });
    }
  } catch (error) {
    console.error("Error updating user meal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCarbDetailsHomeScreen = async (req, res) => {
  try {
    const { userId } = req.query;
    const currentDate = new Date().toLocaleDateString("en-GB");
    const userMeal = await userMealSchema.find({
      userId,
      mealDate: { $eq: currentDate },
    });
    if (userMeal) {
      res.status(200).json(userMeal);
    } else {
      res.status(404).json(null);
    }
  } catch (error) {
    console.error("Error fetching user meal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  storeUserData,
  getDataByFoodType_Uid_Date,
  getUserDataByDate,
  getUserAllDates,
  updateByIdAndFoodType,
  getCarbDetailsHomeScreen,
  updateUserIcr,
  addBloodGlucose,
  bloodGlucoseBefore,
  addBloodGlucoseBeforeMeal,
};
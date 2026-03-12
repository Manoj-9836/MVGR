const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const WellnessData = require("../models/WellnessData");
const {
  classifyStressLevel,
  calculateProductivityScore
} = require("../utils/analysisUtils");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const recordPayload = {
  userId: "student-demo",
  sleep_hours: 6.5,
  screen_time_hours: 5.2,
  study_time_hours: 4.5,
  steps: 7200,
  heart_rate: 78,
  stress_score: 2.58
};

async function run() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/habitlens";

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const existing = await WellnessData.findOne({
      userId: recordPayload.userId,
      sleep_hours: recordPayload.sleep_hours,
      screen_time_hours: recordPayload.screen_time_hours,
      study_time_hours: recordPayload.study_time_hours,
      steps: recordPayload.steps,
      heart_rate: recordPayload.heart_rate,
      stress_score: recordPayload.stress_score
    });

    if (existing) {
      console.log("Record already exists. No insert needed.");
      await mongoose.disconnect();
      return;
    }

    const data = {
      ...recordPayload,
      stress_level: classifyStressLevel(recordPayload.stress_score),
      productivity_score: calculateProductivityScore(recordPayload)
    };

    const created = await WellnessData.create(data);
    console.log(`Inserted record with id: ${created._id}`);
  } catch (error) {
    console.error("Failed to add student-demo record:", error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

run();

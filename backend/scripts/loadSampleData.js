const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const WellnessData = require("../models/WellnessData");
const {
  calculateStressScore,
  classifyStressLevel,
  calculateProductivityScore
} = require("../utils/analysisUtils");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function resolveSampleDataPath() {
  const configuredPath = process.env.SAMPLE_DATA_FILE;
  if (configuredPath) {
    return path.resolve(__dirname, configuredPath);
  }

  const expandedPath = path.resolve(__dirname, "../data/expandedSampleData.json");
  if (fs.existsSync(expandedPath)) {
    return expandedPath;
  }

  return path.resolve(__dirname, "../data/sampleData.json");
}

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/habitlens";
    await mongoose.connect(mongoUri);

    const dataFilePath = resolveSampleDataPath();
    const raw = fs.readFileSync(dataFilePath, "utf8");

    const sampleData = JSON.parse(raw).map((item) => {
      const stress_score = calculateStressScore(item);
      return {
        ...item,
        userId: "student-demo",
        stress_score,
        stress_level: classifyStressLevel(stress_score),
        productivity_score: calculateProductivityScore(item)
      };
    });

    await WellnessData.insertMany(sampleData);
    console.log(`Loaded ${sampleData.length} sample wellness records from ${path.basename(dataFilePath)}.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Sample data load failed:", error.message);
    process.exit(1);
  }
}

run();

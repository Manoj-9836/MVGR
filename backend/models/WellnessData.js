const mongoose = require("mongoose");

const WellnessDataSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "student-demo"
    },
    sleep_hours: {
      type: Number,
      required: true,
      min: 0
    },
    screen_time_hours: {
      type: Number,
      required: true,
      min: 0
    },
    study_time_hours: {
      type: Number,
      required: true,
      min: 0
    },
    steps: {
      type: Number,
      required: true,
      min: 0
    },
    heart_rate: {
      type: Number,
      required: true,
      min: 0
    },
    stress_score: {
      type: Number,
      required: true,
      min: 0
    },
    stress_level: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    productivity_score: {
      type: Number,
      required: true,
      min: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model("WellnessData", WellnessDataSchema);

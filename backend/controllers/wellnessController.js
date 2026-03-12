const axios = require("axios");
const mongoose = require("mongoose");
const WellnessData = require("../models/WellnessData");
const {
  calculateStressScore,
  classifyStressLevel,
  calculateProductivityScore
} = require("../utils/analysisUtils");
const { generateInsights, buildAdvisorResponse } = require("../utils/insightsEngine");

const inMemoryRecords = [];

function isDbAvailable() {
  return mongoose.connection.readyState === 1;
}

function asAscendingRecords() {
  return [...inMemoryRecords].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function asDescendingRecords() {
  return [...inMemoryRecords].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function createWellnessData(req, res) {
  try {
    const payload = req.body;
    const stress_score = calculateStressScore(payload);
    const stress_level = classifyStressLevel(stress_score);
    const productivity_score = calculateProductivityScore(payload);

    let record;
    if (isDbAvailable()) {
      record = await WellnessData.create({
        userId: payload.userId || "student-demo",
        sleep_hours: payload.sleep_hours,
        screen_time_hours: payload.screen_time_hours,
        study_time_hours: payload.study_time_hours,
        steps: payload.steps,
        heart_rate: payload.heart_rate,
        stress_score,
        stress_level,
        productivity_score
      });
    } else {
      record = {
        _id: `mem-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        userId: payload.userId || "student-demo",
        sleep_hours: payload.sleep_hours,
        screen_time_hours: payload.screen_time_hours,
        study_time_hours: payload.study_time_hours,
        steps: payload.steps,
        heart_rate: payload.heart_rate,
        stress_score,
        stress_level,
        productivity_score,
        createdAt: new Date().toISOString()
      };
      inMemoryRecords.push(record);
    }

    res.status(201).json({
      message: "Wellness data stored",
      data: record,
      insights: generateInsights(record)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getWellnessData(req, res) {
  try {
    const records = isDbAvailable()
      ? await WellnessData.find().sort({ createdAt: -1 }).limit(30)
      : asDescendingRecords().slice(0, 30);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAnalysis(req, res) {
  try {
    const records = isDbAvailable()
      ? await WellnessData.find().sort({ createdAt: 1 })
      : asAscendingRecords();

    if (!records.length) {
      return res.json({
        summary: null,
        trends: [],
        ml_prediction: null,
        message: "No wellness records available"
      });
    }

    const latest = records[records.length - 1];
    const summary = {
      avgSleep: Number(
        (records.reduce((sum, r) => sum + r.sleep_hours, 0) / records.length).toFixed(2)
      ),
      avgScreenTime: Number(
        (
          records.reduce((sum, r) => sum + r.screen_time_hours, 0) / records.length
        ).toFixed(2)
      ),
      avgStudyTime: Number(
        (
          records.reduce((sum, r) => sum + r.study_time_hours, 0) / records.length
        ).toFixed(2)
      ),
      avgStressScore: Number(
        (records.reduce((sum, r) => sum + r.stress_score, 0) / records.length).toFixed(2)
      ),
      avgProductivityScore: Number(
        (
          records.reduce((sum, r) => sum + r.productivity_score, 0) / records.length
        ).toFixed(2)
      )
    };

    let mlPrediction = null;
    let causalAnalysis = null;
    const serviceUrl =
      process.env.ANALYSIS_SERVICE_URL || "http://127.0.0.1:5001";

    try {
      const prediction = await axios.post(`${serviceUrl}/predict-stress`, {
        sleep_hours: latest.sleep_hours,
        screen_time_hours: latest.screen_time_hours,
        study_time_hours: latest.study_time_hours,
        steps: latest.steps,
        heart_rate: latest.heart_rate
      });
      mlPrediction = prediction.data;
    } catch (_error) {
      mlPrediction = { message: "Python analysis service unavailable" };
    }

    try {
      const causal = await axios.post(`${serviceUrl}/causal-analysis`, {
        max_lag: 2,
        records: records.map((item) => ({
          sleep_hours: item.sleep_hours,
          screen_time_hours: item.screen_time_hours,
          study_time_hours: item.study_time_hours,
          steps: item.steps,
          heart_rate: item.heart_rate,
          stress_score: item.stress_score
        }))
      });
      causalAnalysis = causal.data;
    } catch (_error) {
      causalAnalysis = { message: "Causal analysis unavailable" };
    }

    return res.json({
      latest,
      summary,
      trends: records,
      ml_prediction: mlPrediction,
      causal_analysis: causalAnalysis
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getInsights(req, res) {
  try {
    const records = isDbAvailable()
      ? await WellnessData.find().sort({ createdAt: -1 }).limit(14)
      : asDescendingRecords().slice(0, 14);

    if (!records.length) {
      return res.json({ insights: [], advisor_response: "No data available yet." });
    }

    const latest = records[0];
    const aggregate = {
      avgSleep: Number(
        (records.reduce((sum, item) => sum + item.sleep_hours, 0) / records.length).toFixed(2)
      ),
      avgScreenTime: Number(
        (
          records.reduce((sum, item) => sum + item.screen_time_hours, 0) /
          records.length
        ).toFixed(2)
      )
    };

    // Fetch causal analysis to power recommendations and advisor response
    let causalData = null;
    const serviceUrl = process.env.ANALYSIS_SERVICE_URL || "http://127.0.0.1:5001";
    try {
      const ascRecords = [...records].reverse();
      const causal = await axios.post(`${serviceUrl}/causal-analysis`, {
        records: ascRecords.map((item) => ({
          sleep_hours: item.sleep_hours,
          screen_time_hours: item.screen_time_hours,
          study_time_hours: item.study_time_hours,
          steps: item.steps,
          heart_rate: item.heart_rate,
          stress_score: item.stress_score
        }))
      });
      causalData = causal.data;
    } catch (_err) {
      // Falls back to rule-based insights when the Python service is unavailable
    }

    const insights = generateInsights(latest, causalData);
    const question = req.query.q || "Why am I stressed?";
    const advisorResponse = buildAdvisorResponse(question, aggregate, latest, causalData);

    return res.json({
      insights,
      advisor_response: advisorResponse,
      based_on: latest.createdAt
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createWellnessData,
  getWellnessData,
  getAnalysis,
  getInsights
};

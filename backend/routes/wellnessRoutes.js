const express = require("express");
const {
  createWellnessData,
  getWellnessData,
  getAnalysis,
  getInsights
} = require("../controllers/wellnessController");

const router = express.Router();

router.post("/wellness", createWellnessData);
router.get("/wellness", getWellnessData);
router.get("/analysis", getAnalysis);
router.get("/insights", getInsights);

module.exports = router;

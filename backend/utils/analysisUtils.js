function calculateStressScore({ sleep_hours, screen_time_hours, heart_rate }) {
  const sleepDeficit = Math.max(0, 8 - sleep_hours);
  const stressScore =
    0.35 * screen_time_hours +
    0.35 * sleepDeficit +
    0.3 * (heart_rate / 100);

  return Number(stressScore.toFixed(2));
}

function classifyStressLevel(stressScore) {
  if (stressScore < 3) {
    return "Low";
  }
  if (stressScore < 5) {
    return "Medium";
  }
  return "High";
}

function calculateProductivityScore({ study_time_hours, sleep_hours }) {
  const score = study_time_hours * (sleep_hours / 8);
  return Number(score.toFixed(2));
}

module.exports = {
  calculateStressScore,
  classifyStressLevel,
  calculateProductivityScore
};

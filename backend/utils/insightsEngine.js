function generateInsights(data, causalData = null) {
  // When causal analysis provides recommendations, use them as primary insights
  if (causalData && Array.isArray(causalData.recommendations) && causalData.recommendations.length > 0) {
    return causalData.recommendations.slice(0, 4).map((rec) => {
      const conf = rec.confidence_score != null ? ` (${rec.confidence_score}% confidence)` : "";
      return `${rec.causal_pattern}${conf}: ${rec.action}`;
    });
  }

  const insights = [];

  if (data.sleep_hours < 6) {
    insights.push(
      "Low sleep detected. Students sleeping under 6 hours show higher stress levels."
    );
  }

  if (data.screen_time_hours > 7) {
    insights.push(
      "High screen time detected. Reducing screen exposure may improve sleep quality."
    );
  }

  if (data.steps > 8000) {
    insights.push(
      "Good physical activity detected. Active students tend to have better sleep."
    );
  }

  if (insights.length === 0) {
    insights.push("Habits look balanced today. Keep tracking for stronger pattern insights.");
  }

  return insights;
}

function buildAdvisorResponse(question, aggregate, latest, causalData = null) {
  // Causal-powered advisor: lead with the highest-confidence leverage point
  if (causalData && causalData.primary_leverage_point) {
    const plp = causalData.primary_leverage_point;
    const conf =
      plp.confidence_score != null
        ? ` (${plp.confidence_score}% confidence, p=${plp.p_value})`
        : "";
    return (
      `Causal analysis identified ${plp.variable} as your primary stress driver${conf}. ` +
      `${plp.action} Expected impact: ${plp.expected_impact}.`
    );
  }

  const normalizedQuestion = String(question || "").toLowerCase();

  if (!normalizedQuestion.includes("stress")) {
    return "I can help with wellness patterns. Try asking: Why am I stressed?";
  }

  const reasons = [];

  if (aggregate.avgSleep < 6 || latest.sleep_hours < 6) {
    reasons.push("your average sleep is below 6 hours");
  }

  if (aggregate.avgScreenTime > 7 || latest.screen_time_hours > 7) {
    reasons.push("screen time is high");
  }

  if (latest.heart_rate > 85) {
    reasons.push("heart rate trends suggest elevated strain");
  }

  if (reasons.length === 0) {
    return "Your recent stress appears moderate. Continue consistent sleep and study patterns to stabilize stress.";
  }

  return `Your stress may be elevated because ${reasons.join(
    " and "
  )}. Improving sleep duration and reducing late screen exposure can help.`;
}

module.exports = {
  generateInsights,
  buildAdvisorResponse
};

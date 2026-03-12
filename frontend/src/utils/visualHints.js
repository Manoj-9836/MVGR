/**
 * Visual Hints & Tooltips System
 * Provides accessible help for low-literacy users
 * Simple icons + visual indicators instead of text
 */

export const healthIndicators = {
  sleep: {
    icon: "bi bi-moon-stars-fill",
    color: "#c4b5fd",
    goodRange: "7-8 hours",
    badIndicator: "Low",
    excellentIndicator: "Great",
    getStatus: (hours) => {
      if (hours >= 7 && hours <= 9) return "Good range";
      if (hours >= 6 && hours < 7) return "A little low";
      if (hours > 9) return "A little high";
      return "Needs care";
    },
  },
  screenTime: {
    icon: "bi bi-phone-fill",
    color: "#1c1c1e",
    goodRange: "Less than 4 hours",
    badIndicator: "Too much",
    excellentIndicator: "Excellent",
    getStatus: (hours) => {
      if (hours <= 3) return "Excellent";
      if (hours <= 4) return "Good";
      if (hours <= 6) return "High";
      return "Very high";
    },
  },
  steps: {
    icon: "bi bi-person-walking",
    color: "#cbe56b",
    goodRange: "8000-10000 steps",
    badIndicator: "Low activity",
    excellentIndicator: "Active",
    getStatus: (steps) => {
      if (steps >= 10000) return "Excellent";
      if (steps >= 8000) return "Good";
      if (steps >= 5000) return "Low";
      return "Very low";
    },
  },
  heartRate: {
    icon: "bi bi-heart-pulse-fill",
    color: "#ff6b6b",
    goodRange: "60-100 bpm",
    badIndicator: "High",
    excellentIndicator: "Normal",
  },
  studyTime: {
    icon: "bi bi-journal-bookmark-fill",
    color: "#a9b0ff",
    goodRange: "4-5 hours",
    badIndicator: "Not enough",
    excellentIndicator: "Good focus",
  },
};

/**
 * Stress Level Visual Indicator
 * Shows stress as emoji/color instead of numbers only
 */
export const stressIndicator = (stressScore) => {
  if (stressScore <= 1.5) return { icon: "bi bi-emoji-smile-fill", label: "Very calm", color: "#cbe56b" };
  if (stressScore <= 2.0) return { icon: "bi bi-emoji-neutral-fill", label: "Calm", color: "#a9b0ff" };
  if (stressScore <= 2.5) return { icon: "bi bi-dash-circle-fill", label: "Normal", color: "#d9deef" };
  if (stressScore <= 3.0) return { icon: "bi bi-exclamation-triangle-fill", label: "Stressed", color: "#ffa726" };
  return { icon: "bi bi-emoji-frown-fill", label: "Very stressed", color: "#ff6b6b" };
};

/**
 * Productivity Score Indicator
 * Visual representation of productivity levels
 */
export const productivityIndicator = (score) => {
  const percentage = Math.min(score * 20, 100); // Assuming 0-5 scale
  if (percentage >= 80) return { icon: "bi bi-graph-up-arrow", label: "Excellent", color: "#cbe56b" };
  if (percentage >= 60) return { icon: "bi bi-bar-chart-line-fill", label: "Great", color: "#a9b0ff" };
  if (percentage >= 40) return { icon: "bi bi-bar-chart-fill", label: "Good", color: "#d9deef" };
  if (percentage >= 20) return { icon: "bi bi-exclamation-circle-fill", label: "Fair", color: "#ffa726" };
  return { icon: "bi bi-exclamation-triangle-fill", label: "Low", color: "#ff6b6b" };
};

/**
 * Form Validation Indicators
 * Visual feedback for data input - helps users know if input is correct
 */
export const validationIndicators = {
  valid: { icon: "bi bi-check-circle-fill", color: "#cbe56b", message: "Looks good" },
  invalid: { icon: "bi bi-x-circle-fill", color: "#ff6b6b", message: "Please check this value" },
  warning: { icon: "bi bi-exclamation-circle-fill", color: "#ffa726", message: "This value may need attention" },
  info: { icon: "bi bi-info-circle-fill", color: "#a9b0ff", message: "Helpful range" },
};

/**
 * Input Range Hints
 * Visual guides for form fields
 */
export const inputHints = {
  sleep_hours: {
    icon: "bi bi-moon-stars-fill",
    min: 0,
    max: 12,
    recommended: 8,
    hint: "Hours of sleep (0-12)",
    examples: ["6 hours", "7.5 hours", "9 hours"],
  },
  screen_time_hours: {
    icon: "bi bi-phone-fill",
    min: 0,
    max: 16,
    recommended: 3,
    hint: "Screen time (0-16 hours)",
    examples: ["2 hours", "4.5 hours", "6 hours"],
  },
  study_time_hours: {
    icon: "bi bi-journal-bookmark-fill",
    min: 0,
    max: 12,
    recommended: 5,
    hint: "Study hours (0-12)",
    examples: ["3 hours", "5 hours", "7 hours"],
  },
  steps: {
    icon: "bi bi-person-walking",
    min: 0,
    max: 50000,
    recommended: 10000,
    hint: "Daily steps (0-50000)",
    examples: ["5000 steps", "8000 steps", "12000 steps"],
  },
  heart_rate: {
    icon: "bi bi-heart-pulse-fill",
    min: 40,
    max: 200,
    recommended: 70,
    hint: "Heart rate (40-200 bpm)",
    examples: ["60 bpm", "75 bpm", "90 bpm"],
  },
};

/**
 * Visual Progress Indicators
 * Shows user progress toward goals
 */
export const progressVisual = (current, target) => {
  const percentage = Math.min((current / target) * 100, 100);

  if (percentage >= 100) return { width: 100, icon: "bi bi-trophy-fill", label: "Goal reached" };
  if (percentage >= 75) return { width: 100, icon: "bi bi-stars", label: "Almost there" };
  if (percentage >= 50) return { width: percentage, icon: "bi bi-activity", label: "Good progress" };
  if (percentage >= 25) return { width: percentage, icon: "bi bi-arrow-up-right-circle-fill", label: "Keep going" };
  return { width: percentage, icon: "bi bi-play-circle-fill", label: "Just started" };
};

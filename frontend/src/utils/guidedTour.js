export const guidedSteps = [
  {
    id: "hero",
    target: ".quick-help",
    nav: "dashboard",
    icon: "bi bi-info-circle-fill",
    title: "Start here",
    content: "This page uses big cards, colors, and short words so you can understand your health quickly.",
    tip: "Look for purple, black, and green first."
  },
  {
    id: "status",
    target: ".current-status",
    nav: "dashboard",
    icon: "bi bi-speedometer2",
    title: "Check these two numbers",
    content: "Stress and productivity are the two main scores. Lower stress and higher productivity are better.",
    tip: "Read these before checking the charts."
  },
  {
    id: "patterns",
    target: ".patterns",
    nav: "dashboard",
    icon: "bi bi-bubbles",
    title: "Read the circles",
    content: "Purple means sleep, black means screen time, and green means daily steps.",
    tip: "If a label shows a warning sign, that habit needs attention."
  },
  {
    id: "testing",
    target: ".guided-testing",
    nav: "dashboard",
    icon: "bi bi-sliders2",
    title: "Try your own numbers",
    content: "Use the testing form to enter simple values, then save. The dashboard will refresh with your result.",
    tip: "You can use the sample button if you want to test quickly."
  },
  {
    id: "insights",
    target: ".insights",
    nav: "dashboard",
    icon: "bi bi-lightbulb-fill",
    title: "Follow the first advice",
    content: "The insights card shows the best action to improve your wellness. Start with the first recommendation.",
    tip: "Do one small change first instead of trying everything."
  },
  {
    id: "settings",
    target: ".settings-panel",
    nav: "settings",
    icon: "bi bi-gear-fill",
    title: "Change language or replay guide",
    content: "Use Settings to change the dashboard language or start this guide again any time.",
    tip: "This helps first-time users and local-language users."
  }
];

/**
 * Check if user has completed tour
 * Returns true if tour has been completed before
 */
export const hasTourBeenCompleted = () => {
  return localStorage.getItem("habitlens-tour-completed") === "true";
};

/**
 * Mark tour as completed
 */
export const markTourCompleted = () => {
  localStorage.setItem("habitlens-tour-completed", "true");
};

/**
 * Reset tour (useful for testing)
 */
export const resetTour = () => {
  localStorage.removeItem("habitlens-tour-completed");
};

/**
 * Get tour state from localStorage
 */
export const getTourState = () => {
  return !hasTourBeenCompleted();
};

// Centralized feature flag definitions for frontend
// These flags can be toggled via environment variables (Vite uses VITE_ prefix).

export const FEATURES = {
  studyPlans: import.meta.env.VITE_FEATURE_STUDY_PLANS === "true",
  classroom: import.meta.env.VITE_FEATURE_CLASSROOM === "true",
};

// Example usage:
// if (FEATURES.studyPlans) { /* render study plan related UI */ }

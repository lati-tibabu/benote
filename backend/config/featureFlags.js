// Feature flag helpers for backend
// Use environment variables to toggle legacy education modules during pivot.

module.exports = {
  studyPlans: process.env.FEATURE_STUDY_PLANS === "true",
  classroom: process.env.FEATURE_CLASSROOM === "true",
};

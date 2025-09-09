// Centralized configuration for backend endpoints
// Update these to match your Firebase project and emulator/production setup

export const FUNCTIONS_BASE_URL = (
  import.meta.env.VITE_FUNCTIONS_BASE_URL as string
) || 'http://127.0.0.1:5001/project-70cbf/us-central1';

export const ENDPOINTS = {
  sendRecommendationEmail: `${FUNCTIONS_BASE_URL}/sendRecommendationEmail`,
  sendAnalysisReport: `${FUNCTIONS_BASE_URL}/sendAnalysisReport`,
  sendPasswordReset: `${FUNCTIONS_BASE_URL}/sendPasswordReset`,
  analyzeCode: `${FUNCTIONS_BASE_URL}/analyzeCode`,
};



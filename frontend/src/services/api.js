const API_BASE_URL = "http://localhost:8000";

/**
 * Submit construction details and get cost prediction.
 * @param {Object} formData - Input features matching PredictionInput schema
 * @returns {Promise<Object>} Prediction result
 */
export const getPrediction = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Prediction request failed");
  }

  return response.json();
};

/**
 * Fetch feature importance data from the model.
 * @returns {Promise<Object>} Feature names and importance scores
 */
export const getFeatureImportance = async () => {
  const response = await fetch(`${API_BASE_URL}/feature-importance`);
  if (!response.ok) throw new Error("Failed to fetch feature importance");
  return response.json();
};

/**
 * Check API health status.
 * @returns {Promise<Object>} Health status object
 */
export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("API health check failed");
  return response.json();
};
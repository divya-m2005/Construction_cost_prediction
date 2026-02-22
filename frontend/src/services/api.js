// const API_BASE_URL = "http://localhost:8000";

// /**
//  * Submit construction details and get cost prediction.
//  * @param {Object} formData - Input features matching PredictionInput schema
//  * @returns {Promise<Object>} Prediction result
//  */
// export const getPrediction = async (formData) => {
//   const response = await fetch(`${API_BASE_URL}/predict`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(formData),
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.detail || "Prediction request failed");
//   }

//   return response.json();
// };

// /**
//  * Fetch feature importance data from the model.
//  * @returns {Promise<Object>} Feature names and importance scores
//  */
// export const getFeatureImportance = async () => {
//   const response = await fetch(`${API_BASE_URL}/feature-importance`);
//   if (!response.ok) throw new Error("Failed to fetch feature importance");
//   return response.json();
// };

// /**
//  * Check API health status.
//  * @returns {Promise<Object>} Health status object
//  */
// export const checkHealth = async () => {
//   const response = await fetch(`${API_BASE_URL}/health`);
//   if (!response.ok) throw new Error("API health check failed");
//   return response.json();
// };
const API_BASE_URL = "http://127.0.0.1:8000";

export const getPrediction = async (formData) => {
  const payload = {
    area_sqft: parseFloat(formData.area_sqft),
    num_floors: parseInt(formData.num_floors),
    project_type: formData.project_type,
    location_zone: formData.location_zone,
    foundation_type: formData.foundation_type,
    wall_material: formData.wall_material,
    roof_type: formData.roof_type,
    has_basement: Boolean(formData.has_basement),
    has_parking: Boolean(formData.has_parking),
    quality_grade: formData.quality_grade,
    soil_type: formData.soil_type,
    distance_to_city_center: parseFloat(formData.distance_to_city_center),
    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
  };

  console.log("Sending payload:", payload);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("API Error:", error);
    throw new Error(error.detail || "Prediction request failed");
  }

  return response.json();
};

export const getFeatureImportance = async () => {
  const response = await fetch(`${API_BASE_URL}/feature-importance`);
  if (!response.ok) throw new Error("Failed to fetch feature importance");
  return response.json();
};

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("API health check failed");
  return response.json();
};
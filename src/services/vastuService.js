/**
 * Vastu Checker API Service
 *
 * Handles communication with the backend Vastu analysis API.
 * This is a public endpoint - no authentication required.
 */

import axios from 'axios';

// Use direct API URL in production to bypass Netlify's 26s proxy timeout
// Vastu analysis requires up to 3 minutes for AI processing
const API_BASE_URL = import.meta.env.PROD
  ? `${import.meta.env.VITE_API_SERVER || 'https://api.360ghar.com'}/api/v1`
  : '/api';

const vastuApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes for AI processing
});

/**
 * Analyze a floor plan image for Vastu compliance
 *
 * @param {File} imageFile - The floor plan image file (JPEG, PNG, or WebP)
 * @param {string} northDirection - Direction of North in the image: up, down, left, right, unknown
 * @param {string} notes - Optional user notes about the property (max 1000 chars)
 * @returns {Promise<Object>} Analysis result with score, report, and structured data
 */
export const analyzeFloorPlan = async (
  imageFile,
  northDirection = 'up',
  notes = ''
) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('north_direction', northDirection);
  formData.append('notes', notes || '');
  formData.append('provider', 'glm'); // Default to GLM-4V-Flash

  const response = await vastuApi.post('/vastu/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Check if the Vastu analyzer service is healthy
 *
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await vastuApi.get('/vastu/health');
  return response.data;
};


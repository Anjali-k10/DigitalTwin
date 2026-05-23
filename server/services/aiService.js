import axios from 'axios';

const FLASK_AI_URL = process.env.FLASK_AI_URL || 'http://localhost:5050';
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 2500;

const aiClient = axios.create({
  baseURL: FLASK_AI_URL,
  timeout: AI_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictBurnout = async (payload) => {
  const response = await aiClient.post('/api/predict/burnout', payload);
  return response.data;
};

export const predictProductivity = async (payload) => {
  const response = await aiClient.post('/api/predict/productivity', payload);
  return response.data;
};

export const analyzeCorrelations = async (payload) => {
  const response = await aiClient.post('/api/analyze/correlation', payload);
  return response.data;
};

export default {
  predictBurnout,
  predictProductivity,
  analyzeCorrelations,
};

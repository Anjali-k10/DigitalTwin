import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token || ''}`,
      Accept: 'application/json',
    },
  };
};

export const connectGoogleFit = async () => {
  console.log('[1] OAuth Start - connectGoogleFit called');
  const response = await axios.post(
    `${API_BASE_URL}/api/health/integration`,
    { integrationLink: 'anjali_googlefit' },
    getHeaders()
  );
  return response.data;
};

export const connectMockDevice = async () => {
  console.log('[Mock Fitband] connectMockDevice called');
  const response = await axios.post(
    `${API_BASE_URL}/api/health/integration`,
    { integrationLink: 'anjali_fitband' },
    getHeaders()
  );
  return response.data;
};

export const getIntegrationStatus = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/health/integration`, getHeaders());
  return response.data;
};

export const getMetrics = async (provider) => {
  if (provider === 'anjali_googlefit') {
    console.log('[Google Fit] getMetrics called for Google Fit');
    const response = await axios.get(`${API_BASE_URL}/api/health/google/live`, getHeaders());
    return response.data;
  } else if (provider === 'anjali_fitband') {
    console.log('[Mock Fitband] getMetrics called for Mock Device');
    const response = await axios.get(`${API_BASE_URL}/api/health/integration/metrics`, getHeaders());
    return response.data;
  } else {
    throw new Error(`Unsupported health provider: ${provider}`);
  }
};

export const disconnect = async () => {
  const response = await axios.delete(`${API_BASE_URL}/api/health/integration`, getHeaders());
  return response.data;
};

export default {
  connectGoogleFit,
  connectMockDevice,
  getIntegrationStatus,
  getMetrics,
  disconnect,
};

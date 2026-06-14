/**
 * Mock Fitband Service
 * Returns deterministic mock health metrics
 */
export const getMetrics = () => {
  console.log('[Mock Fitband Service] Mock metric fetch');
  return {
    source: "mock",
    steps: 7345,
    heartRate: 74,
    sleepHours: 7.2,
    calories: 430,
    distanceKm: 5.8
  };
};

export default {
  getMetrics
};

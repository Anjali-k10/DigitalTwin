import axios from 'axios';
import User from '../models/User.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const AGGREGATE_URL = 'https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate';

function nowMillis() { return Date.now(); }

async function refreshAccessToken(user) {
  const refreshToken = user.healthIntegration?.googleFit?.refreshToken;
  if (!refreshToken) throw new Error('No refresh token available');
  
  const params = new URLSearchParams();
  params.append('client_id', process.env.GOOGLE_CLIENT_ID);
  params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  try {
    const res = await axios.post(TOKEN_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = res.data || {};
    const expiresAt = data.expires_in ? new Date(nowMillis() + (data.expires_in * 1000)) : null;

    user.healthIntegration = user.healthIntegration || {};
    user.healthIntegration.googleFit = user.healthIntegration.googleFit || {};
    user.healthIntegration.googleFit.accessToken = data.access_token || user.healthIntegration.googleFit.accessToken;
    user.healthIntegration.googleFit.refreshToken = data.refresh_token || user.healthIntegration.googleFit.refreshToken;
    user.healthIntegration.googleFit.tokenExpiresAt = expiresAt || user.healthIntegration.googleFit.tokenExpiresAt;
    user.healthIntegration.googleFit.scope = data.scope || user.healthIntegration.googleFit.scope || '';

    await user.save();
    return user.healthIntegration.googleFit.accessToken;
  } catch (err) {
    console.error('[4] Token Refresh - Failed:', err.response?.data || err.message);
    throw err;
  }
}

async function ensureAccessToken(user) {
  const gf = user.healthIntegration?.googleFit || {};
  if (!gf.accessToken) {
    return await refreshAccessToken(user);
  }
  if (gf.tokenExpiresAt && new Date(gf.tokenExpiresAt).getTime() < (nowMillis() - 60000)) {
    return await refreshAccessToken(user);
  }
  return gf.accessToken;
}

async function fetchDataSources(accessToken) {
  const res = await axios.get('https://fitness.googleapis.com/fitness/v1/users/me/dataSources', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.data?.dataSource || [];
}

function buildAggregateRequest(dataTypeName, startMillis, endMillis) {
  return {
    aggregateBy: [{ dataTypeName }],
    bucketByTime: { durationMillis: endMillis - startMillis },
    startTimeMillis: String(startMillis),
    endTimeMillis: String(endMillis),
  };
}

async function aggregate(accessToken, body) {
  try {
    const res = await axios.post(AGGREGATE_URL, body, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (err) {
    console.error('[6] Google Fit Response - Failed:', err.response?.data || err.message);
    throw err;
  }
}

async function fetchSteps(accessToken, startMillis, endMillis) {
  const body = buildAggregateRequest('com.google.step_count.delta', startMillis, endMillis);
  const data = await aggregate(accessToken, body);
  const buckets = data.bucket || [];
  let steps = 0;
  let hasPoints = false;
  buckets.forEach(b => {
    (b.dataset || []).forEach(ds => {
      (ds.point || []).forEach(p => {
        hasPoints = true;
        (p.value || []).forEach(v => { steps += Number(v.intVal || 0); });
      });
    });
  });
  return { steps, hasPoints };
}

async function fetchCalories(accessToken, startMillis, endMillis) {
  const body = buildAggregateRequest('com.google.calories.expended', startMillis, endMillis);
  const data = await aggregate(accessToken, body);
  const buckets = data.bucket || [];
  let calories = 0;
  let hasPoints = false;
  buckets.forEach(b => {
    (b.dataset || []).forEach(ds => {
      (ds.point || []).forEach(p => {
        hasPoints = true;
        (p.value || []).forEach(v => { calories += Number(v.fpVal || v.intVal || 0); });
      });
    });
  });
  return { calories: Math.round(calories), hasPoints };
}

async function fetchDistance(accessToken, startMillis, endMillis) {
  const body = buildAggregateRequest('com.google.distance.delta', startMillis, endMillis);
  const data = await aggregate(accessToken, body);
  const buckets = data.bucket || [];
  let meters = 0;
  let hasPoints = false;
  buckets.forEach(b => {
    (b.dataset || []).forEach(ds => {
      (ds.point || []).forEach(p => {
        hasPoints = true;
        (p.value || []).forEach(v => { meters += Number(v.fpVal || v.intVal || 0); });
      });
    });
  });
  const km = +(meters / 1000).toFixed(2);
  return { distanceKm: km, hasPoints };
}

async function fetchHeartRate(accessToken, startMillis, endMillis) {
  try {
    const dataSources = await fetchDataSources(accessToken);
    const hrSources = dataSources.filter(ds => ds.dataType?.name === 'com.google.heart_rate.bpm');
    
    if (hrSources.length === 0) {
      return { heartRate: null, hasPoints: false };
    }

    const selectedSource = hrSources.find(ds => {
      const id = ds.dataStreamId.toLowerCase();
      return id.includes('fastrack') || id.includes('titan');
    }) || hrSources[0];

    const startNanos = BigInt(startMillis) * 1000000n;
    const endNanos = BigInt(endMillis) * 1000000n;
    const datasetId = `${startNanos}-${endNanos}`;

    const res = await axios.get(
      `https://fitness.googleapis.com/fitness/v1/users/me/dataSources/${encodeURIComponent(selectedSource.dataStreamId)}/datasets/${datasetId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const points = res.data?.point || [];
    let sum = 0;
    let count = 0;
    points.forEach(p => {
      (p.value || []).forEach(v => {
        const val = Number(v.fpVal || v.intVal || 0);
        if (val > 0) {
          sum += val;
          count += 1;
        }
      });
    });

    const average = count > 0 ? Math.round(sum / count) : null;
    return { heartRate: average, hasPoints: points.length > 0 };
  } catch (err) {
    console.error('[HEART RATE] Fetch failed:', err.response?.data || err.message);
    return { heartRate: null, hasPoints: false };
  }
}

async function fetchSleep(accessToken, startMillis, endMillis) {
  try {
    const dataSources = await fetchDataSources(accessToken);
    const sleepSources = dataSources.filter(ds => ds.dataType?.name === 'com.google.sleep.segment');
    
    if (sleepSources.length === 0) {
      return { sleepHours: null, hasPoints: false };
    }

    const selectedSource = sleepSources.find(ds => {
      const id = ds.dataStreamId.toLowerCase();
      return id.includes('fastrack') || id.includes('titan') || id.startsWith('raw:');
    }) || sleepSources[0];

    const startNanos = BigInt(startMillis) * 1000000n;
    const endNanos = BigInt(endMillis) * 1000000n;
    const datasetId = `${startNanos}-${endNanos}`;

    const res = await axios.get(
      `https://fitness.googleapis.com/fitness/v1/users/me/dataSources/${encodeURIComponent(selectedSource.dataStreamId)}/datasets/${datasetId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const points = res.data?.point || [];
    let sleepMs = 0;
    points.forEach(p => {
      const start = Number(p.startTimeNanos || 0);
      const end = Number(p.endTimeNanos || 0);
      if (end > start) {
        sleepMs += Math.round((end - start) / 1e6);
      }
    });

    const hours = points.length > 0 ? +(sleepMs / (1000 * 60 * 60)).toFixed(1) : null;
    return { sleepHours: hours, hasPoints: points.length > 0 };
  } catch (err) {
    console.error('[SLEEP] Fetch failed:', err.response?.data || err.message);
    return { sleepHours: null, hasPoints: false };
  }
}

function normalizeMetrics(raw) {
  const normalized = {
    steps: raw.steps.hasPoints ? raw.steps.steps : 0,
    heartRate: raw.heartRate.hasPoints ? raw.heartRate.heartRate : null,
    sleepHours: raw.sleep.hasPoints ? raw.sleep.sleepHours : null,
    calories: raw.calories.hasPoints ? raw.calories.calories : null,
    distanceKm: raw.distance.hasPoints ? raw.distance.distanceKm : 0,
  };

  return normalized;
}

async function getLiveMetricsForUser(user) {
  const accessToken = await ensureAccessToken(user);
  const end = Date.now();
  const start = end - (24 * 60 * 60 * 1000); // last 24 hours

  const [steps, heartRate, sleep, calories, distance] = await Promise.all([
    fetchSteps(accessToken, start, end),
    fetchHeartRate(accessToken, start, end),
    fetchSleep(accessToken, start, end),
    fetchCalories(accessToken, start, end),
    fetchDistance(accessToken, start, end),
  ]);

  const raw = { steps, heartRate, sleep, calories, distance };
  const result = normalizeMetrics(raw);
  return result;
}

export default {
  ensureAccessToken,
  refreshAccessToken,
  getLiveMetricsForUser,
};

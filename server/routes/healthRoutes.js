import express from 'express';
import {
  createHealth, getHealth, getHealthAnalytics, getHealthTrajectory,
  getPeriods, getPregnancy, logSleep, logWorkout,
  savePeriods, savePregnancy, updateHealth,
} from '../controllers/healthController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import DailyTracking from '../models/DailyTracking.js';
import GamificationEngine from '../services/GamificationEngine.js';
import { todayKey } from '../services/domainDataService.js';

const router = express.Router();

router.get('/',           authenticateToken, asyncHandler(getHealth));
router.post('/',          authenticateToken, asyncHandler(createHealth));
router.put('/',           authenticateToken, asyncHandler(updateHealth));
router.get('/analytics',  authenticateToken, asyncHandler(getHealthAnalytics));
router.get('/trajectory', authenticateToken, asyncHandler(getHealthTrajectory));
router.get('/periods',    authenticateToken, asyncHandler(getPeriods));
router.post('/periods',   authenticateToken, asyncHandler(savePeriods));
router.get('/pregnancy',  authenticateToken, asyncHandler(getPregnancy));
router.post('/pregnancy', authenticateToken, asyncHandler(savePregnancy));
router.get('/status',     (req, res) => res.status(200).json({ success: true, message: 'Server is running' }));
router.post('/workout',   authenticateToken, logWorkout);
router.post('/sleep',     authenticateToken, logSleep);

// FIXED: vitals - was findOneAndUpdate (bypasses post-save hook) → now find+save
router.post('/vitals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { stressLevel, mood, waterLiters } = req.body;
    const today = todayKey();

    let daily = await DailyTracking.findOne({ userId, dateString: today });
    if (!daily) daily = new DailyTracking({ userId, dateString: today });

    daily._prevSnapshot = {
      health:  { caloriesConsumed: daily.health.caloriesConsumed||0, proteinConsumed: daily.health.proteinConsumed||0, waterLiters: daily.health.waterLiters||0, sleepHours: daily.health.sleepHours||0, workouts: (daily.health.workouts||[]).map(w=>({type:w.type,durationMinutes:w.durationMinutes})) },
      finance: { moneySpent: daily.finance.moneySpent||0, moneyCredited: daily.finance.moneyCredited||0 },
    };

    if (stressLevel !== undefined) daily.health.stressLevel = stressLevel;
    if (mood        !== undefined) daily.health.mood        = mood;
    if (waterLiters !== undefined) daily.health.waterLiters = (daily.health.waterLiters||0) + Number(waterLiters);

    await daily.save(); // post-save hook fires GoalSyncEngine

    const gamification = await GamificationEngine.logEvent(userId, 'VITALS_LOGGED', { stressLevel, mood, waterLiters, addedValue: Number(waterLiters) || 1 });
    res.status(200).json({ success: true, gamification });
  } catch (error) {
    console.error('Vitals Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// NEW: biometric-sync route for real-time facial/mood logs
router.post('/biometric-sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { metrics, mood, metadata } = req.body;
    const today = todayKey();

    let daily = await DailyTracking.findOne({ userId, dateString: today });
    if (!daily) daily = new DailyTracking({ userId, dateString: today });

    daily._prevSnapshot = {
      health:  { caloriesConsumed: daily.health.caloriesConsumed||0, proteinConsumed: daily.health.proteinConsumed||0, waterLiters: daily.health.waterLiters||0, sleepHours: daily.health.sleepHours||0, workouts: (daily.health.workouts||[]).map(w=>({type:w.type,durationMinutes:w.durationMinutes})) },
      finance: { moneySpent: daily.finance.moneySpent||0, moneyCredited: daily.finance.moneyCredited||0 },
    };

    // Update health vitals block
    if (!daily.health.vitals) daily.health.vitals = {};
    
    // Store detailed biometrics mapping
    daily.health.vitals.biometrics = {
      ...(daily.health.vitals.biometrics || {}),
      stress: metrics?.stress !== undefined ? Number(metrics.stress) : (metadata?.stressIndex !== undefined ? Number(metadata.stressIndex) : undefined),
      fatigue: metrics?.fatigue !== undefined ? Number(metrics.fatigue) : (metadata?.fatigueIndex !== undefined ? Number(metadata.fatigueIndex) : undefined),
      energy: metrics?.energy !== undefined ? Number(metrics.energy) : undefined,
      tension: metrics?.tension !== undefined ? Number(metrics.tension) : (metadata?.tensionIndex !== undefined ? Number(metadata.tensionIndex) : undefined),
      heartRate: metrics?.heartRate !== undefined ? Number(metrics.heartRate) : undefined,
      steps: metrics?.steps !== undefined ? Number(metrics.steps) : undefined,
      sleepHours: metrics?.sleepHours !== undefined ? Number(metrics.sleepHours) : undefined,
      mood: mood || metadata?.mood,
      scannedAt: new Date()
    };

    // Map stress level (0-100) or (1-10) to schema field (1-10)
    let mappedStress = 5;
    const rawStress = metrics?.stress !== undefined ? Number(metrics.stress) : (metrics?.stressLevel !== undefined ? Number(metrics.stressLevel) : (metrics?.stress !== undefined ? Number(metrics.stress) : undefined));
    if (rawStress !== undefined) {
      if (rawStress > 10) {
        mappedStress = Math.max(1, Math.min(10, Math.round(rawStress / 10)));
      } else {
        mappedStress = Math.max(1, Math.min(10, Math.round(rawStress)));
      }
      daily.health.stressLevel = mappedStress;
    }

    // Map mood string to mongoose schema enum ['excellent', 'good', 'neutral', 'bad', 'terrible']
    let mappedMood = 'neutral';
    const rawMood = String(mood || metadata?.mood || '').toLowerCase();
    if (rawMood.includes('performance') || rawMood.includes('flow') || rawMood.includes('excellent')) {
      mappedMood = 'excellent';
    } else if (rawMood.includes('good') || rawMood.includes('balanced')) {
      mappedMood = 'good';
    } else if (rawMood.includes('exhausted') || rawMood.includes('fatigue') || rawMood.includes('bad')) {
      mappedMood = 'bad';
    } else if (rawMood.includes('overloaded') || rawMood.includes('terrible')) {
      mappedMood = 'terrible';
    }
    daily.health.mood = mappedMood;

    // Optional steps or sleep update
    if (metrics?.sleepHours !== undefined) {
      daily.health.sleepHours = Number(metrics.sleepHours);
    }
    if (metrics?.steps !== undefined) {
      daily.health.vitals.steps = Number(metrics.steps);
    }

    daily.markModified('health.vitals');
    await daily.save(); // post-save hook triggers GoalSyncEngine

    const gamification = await GamificationEngine.logEvent(userId, 'VITALS_LOGGED', {
      stressLevel: mappedStress,
      mood: mappedMood,
      addedValue: 1
    });

    res.status(200).json({ success: true, gamification });
  } catch (error) {
    console.error('Biometric Sync Route Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// FIXED: meds - same pattern fix
router.post('/meds', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { medName } = req.body;
    const today = todayKey();

    let daily = await DailyTracking.findOne({ userId, dateString: today });
    if (!daily) daily = new DailyTracking({ userId, dateString: today });

    daily._prevSnapshot = {
      health:  { caloriesConsumed: daily.health.caloriesConsumed||0, proteinConsumed: daily.health.proteinConsumed||0, waterLiters: daily.health.waterLiters||0, sleepHours: daily.health.sleepHours||0, workouts: [] },
      finance: { moneySpent: daily.finance.moneySpent||0, moneyCredited: daily.finance.moneyCredited||0 },
    };

    daily.health.medicationsTaken.push({ name: medName });
    await daily.save();

    const gamification = await GamificationEngine.logEvent(userId, 'MEDS_TAKEN', { medName, addedValue: 1 });
    res.status(200).json({ success: true, gamification });
  } catch (error) {
    console.error('Meds Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;

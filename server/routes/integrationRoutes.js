import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  connectFitbandIntegration,
  connectGithubIntegration,
  connectIntegration,
  connectLeetcodeIntegration,
  connectLinkedinIntegration,
  disconnectIntegration,
  getGithubIntegration,
  getIntegrationStatus,
  getLeetcodeIntegration,
  updateIntegration,
  getHackerrankIntegration,   // NEW
  getCodeforcesIntegration,   // NEW
} from '../controllers/integrationController.js';
import OnboardingProfile from '../models/OnboardingProfile.js';
import DailyTracking from '../models/DailyTracking.js';
import { todayKey } from '../services/domainDataService.js';

const router = express.Router();

const simulateNetwork = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── /health — UNCHANGED ───────────────────────────────────────────────────────
router.get('/health', authenticateToken, async (req, res) => {
  await simulateNetwork(800);

  const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const userId = String(req.user?.userId || 'default');
  const seed   = parseInt(today, 10) + userId.charCodeAt(0) + (userId.charCodeAt(1) || 0);

  const rng = (offset, min, max) => {
    const x = Math.sin(seed + offset) * 10000;
    const t = x - Math.floor(x);
    return Math.floor(t * (max - min + 1)) + min;
  };

  const steps          = rng(1, 5500, 11800);
  const sleepHours     = parseFloat((rng(2, 45, 85) / 10).toFixed(1));
  const avgHeartRate   = rng(3, 62, 84);
  const restingHR      = rng(4, 58, 78);
  const hrv            = rng(5, 32, 78);
  const activeCalories = rng(6, 280, 880);

  const mockHealthData = {
    source: 'Fitbit (Demo)', lastSync: new Date().toISOString(),
    metrics: { steps, activeCalories, sleepHours, avgHeartRate, restingHeartRate: restingHR, hrv },
  };

  let goalsUpdated = [];
  let totalXP = 0;
  try {
    const userId = req.user.userId;
    const todayStr = todayKey();
    let daily = await DailyTracking.findOne({ userId, dateString: todayStr });
    if (!daily) daily = new DailyTracking({ userId, dateString: todayStr });

    daily._prevSnapshot = {
      health:  { caloriesConsumed: daily.health.caloriesConsumed||0, proteinConsumed: daily.health.proteinConsumed||0, waterLiters: daily.health.waterLiters||0, sleepHours: daily.health.sleepHours||0, workouts: (daily.health.workouts||[]).map(w=>({type:w.type,durationMinutes:w.durationMinutes})) },
      finance: { moneySpent: daily.finance.moneySpent||0, moneyCredited: daily.finance.moneyCredited||0 },
    };

    if (sleepHours     > (daily.health.sleepHours      || 0)) daily.health.sleepHours      = sleepHours;
    if (activeCalories > (daily.health.caloriesConsumed || 0)) daily.health.caloriesConsumed = activeCalories;

    if (!daily.health.vitals) daily.health.vitals = {};
    if (steps > (daily.health.vitals.steps || 0)) {
      daily.health.vitals.steps = steps;
      daily.markModified('health.vitals');
    }

    console.log(`[IntegrationRoutes] /health: saving DailyTracking dailyLog for userId=${userId}`);
    daily._skipGoalSync = true;
    await daily.save();

    console.log(`[IntegrationRoutes] /health: executing explicit GoalSyncEngine`);
    const { default: GoalSyncEngine } = await import('../services/GoalSyncEngine.js');
    goalsUpdated = await GoalSyncEngine.syncGoalsFromDailyLog(
      userId,
      daily,
      daily._prevSnapshot || null
    );

    const { default: GamificationService } = await import('../services/GamificationService.js');
    await GamificationService.evaluateRules(userId);

    const { default: GamificationProfile } = await import('../models/GamificationProfile.js');
    const profile = await GamificationProfile.findOne({ userId });
    totalXP = profile ? profile.totalXP : 0;
  } catch (syncErr) {
    console.error('Integration health sync error:', syncErr.message);
  }

  res.status(200).json({ success: true, data: mockHealthData, totalXP, goalProgress: goalsUpdated, goalsUpdated });
});

// ── /finance — UNCHANGED ──────────────────────────────────────────────────────
router.get('/finance', authenticateToken, async (req, res) => {
  try {
    await simulateNetwork(1000);
    const userId = req.user.userId;

    // 1. Get onboarding profile for monthly baseline salary/spending
    const onboarding = await OnboardingProfile.findOne({ userId }).sort({ updatedAt: -1 }).lean();
    const baseSalary = onboarding?.monthlyIncome || 0;
    const baseExpenditure = onboarding?.monthlyExpenditure || 0;

    // 2. Fetch current month's DailyTracking logs to aggregate spent & credited
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const dateStringPrefix = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}`;

    const logsThisMonth = await DailyTracking.find({
      userId,
      dateString: { $regex: new RegExp('^' + dateStringPrefix) }
    }).lean();

    const actualSpentThisMonth = logsThisMonth.reduce((sum, log) => sum + (log.finance?.moneySpent || 0), 0);
    const actualCreditedThisMonth = logsThisMonth.reduce((sum, log) => sum + (log.finance?.moneyCredited || 0), 0);

    // 3. Fetch latest holdings
    const latestLogWithHoldings = await DailyTracking.findOne({
      userId,
      'finance.holdings.0': { $exists: true }
    }).sort({ dateString: -1 }).lean();

    const holdings = latestLogWithHoldings?.finance?.holdings || [];
    const portfolioValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);

    // 4. Calculate total salary & monthly expenses
    const totalSalary = baseSalary + actualCreditedThisMonth;
    const monthlyExpenses = actualSpentThisMonth;

    // Calculate savings rate
    const savingsRate = totalSalary > 0 ? Math.round(((totalSalary - monthlyExpenses) / totalSalary) * 100) : 0;

    const dynamicFinanceData = {
      source: 'Plaid Sync & Twin DB',
      lastSync: new Date().toISOString(),
      creditScore: onboarding?.creditScore || 725,
      accountBalance: Math.max(0, totalSalary - monthlyExpenses),
      totalSalary,
      monthlyExpenses,
      portfolioValue,
      holdings,
      metrics: {
        monthlySavingsRate: `${savingsRate}%`,
        unusualSpikeDetected: monthlyExpenses > baseExpenditure * 1.15
      },
      recentTransactions: logsThisMonth.flatMap(log => log.finance?.transactions || []).slice(0, 15)
    };

    let goalsUpdated = [];
    let totalXP = 0;
    try {
      const todayStr = todayKey();
      let daily = await DailyTracking.findOne({ userId, dateString: todayStr });
      if (!daily) daily = new DailyTracking({ userId, dateString: todayStr });

      daily._prevSnapshot = {
        health:  { caloriesConsumed: daily.health.caloriesConsumed||0, proteinConsumed: daily.health.proteinConsumed||0, waterLiters: daily.health.waterLiters||0, sleepHours: daily.health.sleepHours||0, workouts: (daily.health.workouts||[]).map(w=>({type:w.type,durationMinutes:w.durationMinutes})) },
        finance: { moneySpent: daily.finance.moneySpent||0, moneyCredited: daily.finance.moneyCredited||0 },
      };

      const randomSpent = Math.round(50 + Math.random() * 150);
      daily.finance.moneySpent = (daily.finance.moneySpent || 0) + randomSpent;
      daily.finance.transactions.push({ amount: randomSpent, category: 'Food & Dining', type: 'expense', isImpulse: Math.random() > 0.7 });

      console.log(`[IntegrationRoutes] /finance: saving DailyTracking dailyLog for userId=${userId}`);
      daily._skipGoalSync = true;
      await daily.save();

      console.log(`[IntegrationRoutes] /finance: executing explicit GoalSyncEngine`);
      const { default: GoalSyncEngine } = await import('../services/GoalSyncEngine.js');
      goalsUpdated = await GoalSyncEngine.syncGoalsFromDailyLog(
        userId,
        daily,
        daily._prevSnapshot || null
      );

      const { default: GamificationService } = await import('../services/GamificationService.js');
      await GamificationService.evaluateRules(userId);

      const { default: GamificationProfile } = await import('../models/GamificationProfile.js');
      const profile = await GamificationProfile.findOne({ userId });
      totalXP = profile ? profile.totalXP : 0;
    } catch (syncErr) {
      console.error('Integration finance sync error:', syncErr.message);
    }

    res.status(200).json({ success: true, data: dynamicFinanceData, totalXP, goalProgress: goalsUpdated, goalsUpdated });
  } catch (error) {
    console.error('Integration Finance Sync Error:', error);
    res.status(500).json({ success: false, message: 'Server Error synchronizing finance integration' });
  }
});

// ── /career — UNCHANGED ───────────────────────────────────────────────────────
router.get('/career', authenticateToken, async (req, res) => {
  await simulateNetwork(1200);
  const commits = Math.floor(Math.random() * (45 - 5) + 5);
  const mockCareerData = {
    source: 'GitHub & LinkedIn Connect', lastSync: new Date().toISOString(),
    githubCommitsThisWeek:   commits,
    topLanguages:            ['JavaScript', 'Python', 'C++'],
    recentCertificates:      ['Advanced React Patterns', 'GenAI Prompt Engineering'],
    linkedInProfileStrength: 'All-Star',
    hoursInMeetingsToday:    (Math.random() * (6 - 1) + 1).toFixed(1),
    learning: { courseraActiveCourse: 'Advanced Machine Learning', courseProgress: '65%' },
  };

  let goalsUpdated = [];
  let totalXP = 0;
  try {
    const userId = req.user.userId;
    const todayStr = todayKey();
    let daily = await DailyTracking.findOne({ userId, dateString: todayStr });
    if (!daily) daily = new DailyTracking({ userId, dateString: todayStr });

    daily._prevSnapshot = {
      health:  { caloriesConsumed: daily.health.caloriesConsumed||0, proteinConsumed: daily.health.proteinConsumed||0, waterLiters: daily.health.waterLiters||0, sleepHours: daily.health.sleepHours||0, workouts: (daily.health.workouts||[]).map(w=>({type:w.type,durationMinutes:w.durationMinutes})) },
      finance: { moneySpent: daily.finance.moneySpent||0, moneyCredited: daily.finance.moneyCredited||0 },
      career:  { studyHours: daily.career.studyHours||0, completedCourses: daily.career.completedCourses||0, githubCommits: daily.career.githubCommits||0, projectsCompleted: daily.career.projectsCompleted||0 }
    };

    if (commits > (daily.career.githubCommits || 0)) {
      daily.career.githubCommits = commits;
    }

    console.log(`[IntegrationRoutes] /career: saving DailyTracking dailyLog for userId=${userId}`);
    daily._skipGoalSync = true;
    await daily.save();

    console.log(`[IntegrationRoutes] /career: executing explicit GoalSyncEngine`);
    const { default: GoalSyncEngine } = await import('../services/GoalSyncEngine.js');
    goalsUpdated = await GoalSyncEngine.syncGoalsFromDailyLog(
      userId,
      daily,
      daily._prevSnapshot || null
    );

    const { default: GamificationService } = await import('../services/GamificationService.js');
    await GamificationService.evaluateRules(userId);

    const { default: GamificationProfile } = await import('../models/GamificationProfile.js');
    const profile = await GamificationProfile.findOne({ userId });
    totalXP = profile ? profile.totalXP : 0;
  } catch (syncErr) {
    console.error('Integration career sync error:', syncErr.message);
  }

  res.status(200).json({ success: true, data: mockCareerData, totalXP, goalProgress: goalsUpdated, goalsUpdated });
});

// ── Status / connect / disconnect — UNCHANGED ─────────────────────────────────
router.get('/',           authenticateToken, asyncHandler(getIntegrationStatus));
router.get('/status',     authenticateToken, asyncHandler(getIntegrationStatus));
router.post('/connect',   authenticateToken, asyncHandler(connectIntegration));
router.post('/disconnect', authenticateToken, asyncHandler(disconnectIntegration));
router.post('/github',    authenticateToken, asyncHandler(connectGithubIntegration));
router.post('/leetcode',  authenticateToken, asyncHandler(connectLeetcodeIntegration));
router.post('/linkedin',  authenticateToken, asyncHandler(connectLinkedinIntegration));
router.post('/fitband',   authenticateToken, asyncHandler(connectFitbandIntegration));
router.put('/update',     authenticateToken, asyncHandler(updateIntegration));
router.delete('/',        authenticateToken, asyncHandler(disconnectIntegration));

// ── Onboarding verification routes — UNCHANGED ────────────────────────────────
router.get('/github/:username(*)',   authenticateToken, getGithubIntegration);
router.get('/leetcode/:username(*)', authenticateToken, getLeetcodeIntegration);

// ── NEW: HackerRank and Codeforces routes ─────────────────────────────────────
router.get('/hackerrank/:username(*)', authenticateToken, getHackerrankIntegration);
router.get('/codeforces/:handle(*)',   authenticateToken, getCodeforcesIntegration);

export default router;

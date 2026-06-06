import GamificationProfile from '../models/GamificationProfile.js';
import { getLatestOnboardingProfile, todayKey } from '../services/domainDataService.js';
import DailyTracking from '../models/DailyTracking.js';

export const getCareer = async (req, res) => {
  const onboarding = await getLatestOnboardingProfile(req.user.userId);
  res.status(200).json({
    success: true,
    data: {
      studyHours: onboarding?.studyHours || 0,
      burnoutRisk: onboarding?.burnoutRisk || 0,
      productivityScore: onboarding?.productivityScore || 0,
      careerMomentum: onboarding?.careerMomentum || 0,
      insights: onboarding?.careerInsights || [],
    },
  });
};

export const createCareer = async (req, res) => {
  res.status(201).json({ success: true, data: req.body, message: 'Career entry accepted' });
};

export const updateCareer = async (req, res) => {
  res.status(200).json({ success: true, data: req.body, message: 'Career entry updated' });
};

export const getRoadmap = async (req, res) => {
  const onboarding = await getLatestOnboardingProfile(req.user.userId);
  res.status(200).json({
    success: true,
    data: [
      { title: 'Stabilize daily focus', status: onboarding?.studyHours >= 2 ? 'active' : 'recommended' },
      { title: 'Build two portfolio projects', status: 'recommended' },
      { title: 'Prepare interview loops', status: 'recommended' },
    ],
  });
};

export const getTrajectory = async (req, res) => {
  const onboarding = await getLatestOnboardingProfile(req.user.userId);
  res.status(200).json({
    success: true,
    data: [
      { label: 'Productivity', value: onboarding?.productivityScore || 0 },
      { label: 'Momentum', value: onboarding?.careerMomentum || 0 },
      { label: 'Growth', value: onboarding?.professionalGrowthScore || 0 },
    ],
  });
};

export const getBurnoutAnalysis = async (req, res) => {
  const onboarding = await getLatestOnboardingProfile(req.user.userId);
  res.status(200).json({
    success: true,
    data: {
      burnoutRisk: onboarding?.burnoutRisk || 0,
      recommendation: 'Protect recovery blocks and keep deep work sessions bounded.',
      source: 'fallback',
    },
  });
};

// @desc    Log a completed course/learning session
// @route   POST /api/career/course
export const logCourse = async (req, res) => {
  try {
    // ✅ FIXED: Using .userId
    const userId = req.user.userId; 
    const { courseName } = req.body;
    const today = todayKey();

    let daily = await DailyTracking.findOne({ userId, dateString: today });
    if (!daily) daily = new DailyTracking({ userId, dateString: today });

    daily._prevSnapshot = {
      health:  { caloriesConsumed: daily.health.caloriesConsumed||0, proteinConsumed: daily.health.proteinConsumed||0, waterLiters: daily.health.waterLiters||0, sleepHours: daily.health.sleepHours||0, workouts: [] },
      finance: { moneySpent: daily.finance.moneySpent||0, moneyCredited: daily.finance.moneyCredited||0 },
      career:  { studyHours: daily.career.studyHours||0, completedCourses: daily.career.completedCourses||0, githubCommits: daily.career.githubCommits||0, projectsCompleted: daily.career.projectsCompleted||0 }
    };

    daily.career.completedCourses = (daily.career.completedCourses || 0) + 1;

    daily._skipGoalSync = true;
    await daily.save();

    const { default: GoalSyncEngine } = await import('../services/GoalSyncEngine.js');
    const goalsUpdated = await GoalSyncEngine.syncGoalsFromDailyLog(
      userId,
      daily,
      daily._prevSnapshot || null
    );

    console.log(`[CareerController] logCourse: calling GamificationService.evaluateRules`);
    const { default: GamificationService } = await import('../services/GamificationService.js');
    const gamificationResult = await GamificationService.evaluateRules(userId);

    const profile = await GamificationProfile.findOne({ userId });
    const totalXP = profile ? profile.totalXP : 0;
    res.status(201).json({
      success: true,
      message: 'Course completion logged!',
      gamification: gamificationResult,
      totalXP,
      goalProgress: goalsUpdated
    });
  } catch (error) {
    console.error('Career Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Log a deep work / focus session
// @route   POST /api/career/focus
export const logFocusSession = async (req, res) => {
  try {
    // ✅ FIXED: Using .userId
    const userId = req.user.userId; 
    const { durationMinutes } = req.body;
    const today = todayKey();

    let daily = await DailyTracking.findOne({ userId, dateString: today });
    if (!daily) daily = new DailyTracking({ userId, dateString: today });

    daily._prevSnapshot = {
      health:  { caloriesConsumed: daily.health.caloriesConsumed||0, proteinConsumed: daily.health.proteinConsumed||0, waterLiters: daily.health.waterLiters||0, sleepHours: daily.health.sleepHours||0, workouts: [] },
      finance: { moneySpent: daily.finance.moneySpent||0, moneyCredited: daily.finance.moneyCredited||0 },
      career:  { studyHours: daily.career.studyHours||0, completedCourses: daily.career.completedCourses||0, githubCommits: daily.career.githubCommits||0, projectsCompleted: daily.career.projectsCompleted||0 }
    };

    // Convert minutes to hours for studyHours daily log representation
    const hrs = Number(durationMinutes) / 60;
    daily.career.studyHours = (daily.career.studyHours || 0) + hrs;

    daily._skipGoalSync = true;
    await daily.save();

    const { default: GoalSyncEngine } = await import('../services/GoalSyncEngine.js');
    const goalsUpdated = await GoalSyncEngine.syncGoalsFromDailyLog(
      userId,
      daily,
      daily._prevSnapshot || null
    );

    console.log(`[CareerController] logFocusSession: calling GamificationService.evaluateRules`);
    const { default: GamificationService } = await import('../services/GamificationService.js');
    const gamificationResult = await GamificationService.evaluateRules(userId);

    const profile = await GamificationProfile.findOne({ userId });
    const totalXP = profile ? profile.totalXP : 0;
    res.status(201).json({
      success: true,
      message: 'Focus session logged!',
      gamification: gamificationResult,
      totalXP,
      goalProgress: goalsUpdated
    });
  } catch (error) {
    console.error('Career Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

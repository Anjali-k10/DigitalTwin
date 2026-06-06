import UserGamification from '../models/UserGamification.js';
import ActivityLog from '../models/ActivityLog.js';
import BadgeDefinition from '../models/BadgeDefinition.js';
import LifeProfile from '../models/LifeProfile.js';

const XP_TABLE = {
  EXPENSE_LOGGED: { xp: 10, domain: 'finance' },
  BUDGET_MET: { xp: 30, domain: 'finance' },
  WORKOUT_LOGGED: { xp: 15, domain: 'health' },
  SLEEP_LOGGED: { xp: 10, domain: 'health' },
  COURSE_DONE: { xp: 20, domain: 'career' },
  FOCUS_SESSION_COMPLETED: { xp: 15, domain: 'career' },
  INCOME_LOGGED: { xp: 15, domain: 'finance' },
  DAILY_SYNC_COMPLETED: { xp: 50, domain: 'health' },
  AI_MEAL_LOGGED: { xp: 15, domain: 'health' },
  AI_RECEIPT_LOGGED: { xp: 15, domain: 'finance' },
  AI_MEDICAL_LOGGED: { xp: 20, domain: 'health' },
  VITALS_LOGGED: { xp: 15, domain: 'health' },
  MEDS_TAKEN: { xp: 20, domain: 'health' },
  GOAL_SET: { xp: 25, domain: 'career' },
  GOAL_MILESTONE_HIT: { xp: 50, domain: 'career' },
  GOAL_PROGRESS_LOGGED: { xp: 5,  domain: 'career' },
  GOAL_COMPLETED:       { xp: 100, domain: 'career' },
};

// Calculate level based on XP (Level 1: 0-99, Level 2: 100-249, Level 3: 250-499...)
function calculateLevel(totalXP) {
  if (totalXP < 100) return 1;
  if (totalXP < 250) return 2;
  if (totalXP < 500) return 3;
  if (totalXP < 900) return 4;
  return Math.floor((totalXP - 900) / 500) + 5;
}

// Check if dates are consecutive days
function isYesterday(lastDate, currentDate) {
  if (!lastDate) return false;
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return lastDate.toDateString() === yesterday.toDateString();
}

function isToday(lastDate, currentDate) {
  if (!lastDate) return false;
  return lastDate.toDateString() === currentDate.toDateString();
}

const recentGoalTriggers = new Map();

class GamificationEngine {
  static async logEvent(userId, eventName, metadata = {}) {
    console.log(`[GamificationEngine] logEvent called: userId=${userId}, eventName=${eventName}, metadata=`, metadata);
    try {
      // 1. Deduplicate triggers for the same goalId within 3 seconds
      if (metadata?.goalId) {
        const lastTrigger = recentGoalTriggers.get(metadata.goalId.toString());
        const nowMs = Date.now();
        if (lastTrigger && nowMs - lastTrigger < 3000) {
          console.log(`[GamificationEngine] Rejected duplicate trigger for goalId=${metadata.goalId}`);
          return null; // Silently reject duplicate goal trigger
        }
        recentGoalTriggers.set(metadata.goalId.toString(), nowMs);
      }

      // 2. Strict numeric verification on addedValue
      const addedValue = metadata?.addedValue;
      if (addedValue === undefined || addedValue === null) {
        return null; // Silently reject if undefined or null
      }
      
      const val = Number(addedValue);
      if (isNaN(val) || val <= 0) {
        return null; // Silently reject if not a valid number greater than 0
      }

      // 3. Delta Checking: verify if it represents a NEW achievement or positive delta compared to today's last log
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const query = { userId, event: eventName, createdAt: { $gte: todayStart } };
      if (metadata?.goalId) {
        query['metadata.goalId'] = metadata.goalId;
      }
      
      const lastLogToday = await ActivityLog.findOne(query).sort({ createdAt: -1 });
      if (lastLogToday) {
        const getMetric = (meta) => {
          if (!meta) return 0;
          return Number(meta.addedValue ?? meta.amount ?? meta.value ?? meta.hours ?? meta.duration ?? meta.durationMinutes ?? meta.calories ?? meta.studyHours ?? meta.githubCommits ?? meta.githubCommitsThisWeek ?? 0);
        };
        const newVal = getMetric(metadata);
        const oldVal = getMetric(lastLogToday.metadata);
        if (newVal <= oldVal) {
          return null; // Silently reject if not a positive delta compared to today's last logged value
        }
      }

      const eventConfig = XP_TABLE[eventName];
      if (!eventConfig) return null;

      const { xp, domain } = eventConfig;
      const now = new Date();

      // Ensure user gamification profile exists
      let gamification = await UserGamification.findOne({ userId });
      if (!gamification) {
        gamification = new UserGamification({ userId });
      }

      // Append to ActivityLog
      await ActivityLog.create({
        userId,
        domain,
        event: eventName,
        xpAwarded: xp,
        metadata
      });

      // Update XP and Level
      gamification.totalXP += xp;
      gamification.weeklyXP += xp;
      const newLevel = calculateLevel(gamification.totalXP);
      const levelUp = newLevel > gamification.level;
      gamification.level = newLevel;

      // Update Streaks
      const currentDomainStreak = gamification.streaks[domain];
      if (!isToday(currentDomainStreak.lastActivity, now)) {
        if (isYesterday(currentDomainStreak.lastActivity, now)) {
          currentDomainStreak.current += 1;
        } else {
          currentDomainStreak.current = 1;
        }
        currentDomainStreak.lastActivity = now;
        if (currentDomainStreak.current > currentDomainStreak.best) {
          currentDomainStreak.best = currentDomainStreak.current;
        }
      }

      // Evaluate Badges
      const newBadges = [];
      const userBadgeIds = gamification.badges.map(b => b.badgeId);
      const allDefinitions = await BadgeDefinition.find({ domain });

      for (const badgeDef of allDefinitions) {
        // Skip if user already has it
        if (userBadgeIds.includes(badgeDef.badgeId)) continue;

        let earned = false;
        
        // Evaluate Streak Condition
        if (badgeDef.condition.type === 'streak' && currentDomainStreak.current >= badgeDef.condition.targetValue) {
          earned = true;
        } 
        // Evaluate Event Count Condition
        else if (badgeDef.condition.type === 'event_count' && badgeDef.condition.event === eventName) {
          const count = await ActivityLog.countDocuments({ userId, event: eventName });
          if (count >= badgeDef.condition.targetValue) earned = true;
        }

        if (earned) {
          gamification.badges.push({ badgeId: badgeDef.badgeId });
          newBadges.push(badgeDef);
        }
      }

      await gamification.save();
      console.log(`[GamificationEngine] Successfully saved gamification profile. new totalXP=${gamification.totalXP}, level=${gamification.level}`);

      // Create matching database notification record
      try {
        const { createNotification } = await import('./notificationService.js');
        let goalTitle = eventName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (metadata?.goalId) {
          const SmartGoal = (await import('../models/SmartGoal.js')).default;
          const goal = await SmartGoal.findById(metadata.goalId).lean();
          if (goal) goalTitle = goal.title;
        }
        await createNotification({
          userId,
          category: 'goal',
          subType: 'completed',
          title: '🏆 Achievement Unlocked!',
          message: `Hey Champ! +${xp} XP earned for ${goalTitle}.`,
          priority: 'medium',
          sendEmail: false
        });
      } catch (notiError) {
        console.error('Failed to push gamification notification:', notiError);
      }

      return {
        xpAwarded: xp,
        newTotalXP: gamification.totalXP,
        level: gamification.level,
        levelUp,
        domainStreak: currentDomainStreak.current,
        newBadges
      };

    } catch (error) {
      console.error('Gamification Engine Error:', error);
      return null;
    }
  }
}

export default GamificationEngine;
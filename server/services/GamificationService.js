import GamificationProfile from '../models/GamificationProfile.js';
import ValidationLog from '../models/ValidationLog.js';
import SmartGoal from '../models/SmartGoal.js';
import DailyTracking from '../models/DailyTracking.js';
import { todayKey } from './domainDataService.js';

// Calculate level: Level 1: 0-499, Level 2: 500-999, Level 3: 1000-1499... (500 XP per level)
function calculateLevel(totalXP) {
  return Math.floor(totalXP / 500) + 1;
}

export class GamificationService {
  /**
   * Evaluates ingestion thresholds for a user and awards XP/badges if met.
   * @param {string} userId - User's unique DB ID
   */
  static async evaluateRules(userId) {
    console.log(`[GamificationService] Evaluating rules for userId=${userId}`);
    try {
      const todayStr = todayKey();
      
      // Ensure user gamification profile exists
      let profile = await GamificationProfile.findOne({ userId });
      if (!profile) {
        profile = new GamificationProfile({ userId });
      }

      let xpEarnedThisSync = 0;
      let newLogs = [];
      const userBadgeIds = profile.unlockedBadges || [];

      // 1. Rule 1: Step Master (dailySteps >= 8000)
      const daily = await DailyTracking.findOne({ userId, dateString: todayStr });
      if (daily) {
        const steps = daily.health?.vitals?.steps || 0;
        if (steps >= 8000) {
          const stepKey = `step_master-${userId}-${todayStr}`;
          // Check ValidationLog for idempotency
          const alreadyAwarded = await ValidationLog.findOne({ userId, milestoneKey: stepKey });
          if (!alreadyAwarded) {
            console.log(`[GamificationService] Awarding Step Master. steps=${steps}`);
            await ValidationLog.create({
              userId,
              milestoneKey: stepKey,
              xpAwarded: 50,
              badgeId: 'sleep_master' // Map to circadian/sleep master or similar badge in the dictionary if needed, but badgeId step_master is also fine
            });
            xpEarnedThisSync += 50;
            newLogs.push({ activity: `Hit daily movement target (${steps} steps)`, points: 50, emoji: '👟' });
            
            if (!profile.unlockedBadges.includes('sleep_master')) {
              profile.unlockedBadges.push('sleep_master');
            }
          }
        }

        // 2. Rule 2: Code Warrior (githubCommits >= 10)
        const commits = daily.career?.githubCommits || 0;
        if (commits >= 10) {
          const commitKey = `code_warrior-${userId}-${todayStr}`;
          // Check ValidationLog for idempotency
          const alreadyAwarded = await ValidationLog.findOne({ userId, milestoneKey: commitKey });
          if (!alreadyAwarded) {
            console.log(`[GamificationService] Awarding Code Warrior. commits=${commits}`);
            await ValidationLog.create({
              userId,
              milestoneKey: commitKey,
              xpAwarded: 50,
              badgeId: 'deep_worker'
            });
            xpEarnedThisSync += 50;
            newLogs.push({ activity: `High-volume deep work session verified (${commits} commits)`, points: 50, emoji: '💻' });

            if (!profile.unlockedBadges.includes('deep_worker')) {
              profile.unlockedBadges.push('deep_worker');
            }
          }
        }
      }

      // 3. Rule 3: Goal Crusher (SmartGoal reached/completed)
      const completedGoals = await SmartGoal.find({ userId, status: 'completed' });
      for (const goal of completedGoals) {
        const goalKey = `goal_crusher-${userId}-${goal._id}`;
        // Check ValidationLog for idempotency
        const alreadyAwarded = await ValidationLog.findOne({ userId, milestoneKey: goalKey });
        if (!alreadyAwarded) {
          console.log(`[GamificationService] Awarding Goal Crusher. goal=${goal.title}`);
          await ValidationLog.create({
            userId,
            milestoneKey: goalKey,
            xpAwarded: 100,
            badgeId: 'first_step' // Map to badge from dictionary, or add custom
          });
          xpEarnedThisSync += 100;
          newLogs.push({ activity: `Completed SmartGoal: "${goal.title}"`, points: 100, emoji: '🏆' });

          if (!profile.unlockedBadges.includes('first_step')) {
            profile.unlockedBadges.push('first_step');
          }
        }
      }

      if (xpEarnedThisSync > 0) {
        profile.totalXP += xpEarnedThisSync;
        profile.level = calculateLevel(profile.totalXP);
        profile.history.push(...newLogs.map(log => ({
          activity: log.activity,
          points: log.points,
          emoji: log.emoji,
          timestamp: new Date()
        })));
        profile.lastSyncDate = new Date();
        await profile.save();

        console.log(`[GamificationService] Success: Awarded +${xpEarnedThisSync} XP to userId=${userId}. New Total XP=${profile.totalXP}`);
        
        // Push notification
        try {
          const { createNotification } = await import('./notificationService.js');
          for (const log of newLogs) {
            await createNotification({
              userId,
              category: 'goal',
              subType: 'completed',
              title: '🏆 Achievement Unlocked!',
              message: `Hey Champ! +${log.points} XP earned for: ${log.activity}.`,
              priority: 'medium',
              sendEmail: false
            });
          }
        } catch (notiErr) {
          console.error('[GamificationService] Notification error:', notiErr.message);
        }
      }

      return {
        success: true,
        xpAwarded: xpEarnedThisSync,
        totalXP: profile.totalXP,
        level: profile.level,
        newBadges: profile.unlockedBadges
      };

    } catch (error) {
      console.error('[GamificationService] Evaluation error:', error);
      throw error;
    }
  }
}

export default GamificationService;

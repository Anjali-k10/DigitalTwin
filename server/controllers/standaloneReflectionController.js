import DailyTracking from '../models/DailyTracking.js';
import LifeProfile from '../models/LifeProfile.js';
import SmartGoal from '../models/SmartGoal.js';
import DailyUpdate from '../models/DailyUpdate.js';
import Upload from '../models/Upload.js';
import OnboardingProfile from '../models/OnboardingProfile.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with the dedicated key
const getGenAIClient = () => {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY_INTELLIGENCE);
};

export const getStandaloneReflection = async (req, res) => {
  try {
    const userId = req.user.userId;

    const dailyLogs = await DailyTracking.find({ userId }).sort({ dateString: 1 }).lean();
    const dailyUpdates = await DailyUpdate.find({ userId }).sort({ date: 1 }).lean();
    const uploads = await Upload.find({ userId }).lean();
    const smartGoals = await SmartGoal.find({ userId }).lean();
    const onboarding = await OnboardingProfile.findOne({ userId }).sort({ updatedAt: -1 }).lean() || {};
    const lifeProfile = await LifeProfile.findOne({ userId }).lean() || {};

    // Determine actual data sources used
    const dataSourcesUsed = [];
    if (onboarding.githubUsername || dailyLogs.some(log => log.career?.githubCommits > 0)) {
      dataSourcesUsed.push('github');
    }
    if (onboarding.selectedSignals?.includes('whatsapp') || onboarding.selectedSignals?.includes('whatsapp_sync')) {
      dataSourcesUsed.push('whatsapp');
    }
    if (dailyUpdates.length > 0) {
      dataSourcesUsed.push('manual');
    }
    if (uploads.length > 0) {
      dataSourcesUsed.push('documents');
    }
    if (dataSourcesUsed.length === 0) {
      dataSourcesUsed.push('manual');
    }

    const daysTracked = Math.max(1, dailyLogs.length, dailyUpdates.length);

    // Calculate actual DB log statistics to build zero-hallucinated stats
    let healthLogCount = 0;
    let financeLogCount = 0;
    let careerLogCount = 0;

    dailyLogs.forEach(log => {
      if (log.health && (log.health.caloriesConsumed > 0 || log.health.sleepHours > 0 || log.health.vitals?.steps > 0 || log.health.workouts?.length > 0 || log.health.stressLevel > 0)) {
        healthLogCount++;
      }
      if (log.finance && (log.finance.moneySpent > 0 || log.finance.moneyCredited > 0 || log.finance.transactions?.length > 0)) {
        financeLogCount++;
      }
      if (log.career && (log.career.studyHours > 0 || log.career.githubCommits > 0 || log.career.projectsCompleted > 0 || log.career.completedCourses > 0)) {
        careerLogCount++;
      }
    });

    const totalCommits = dailyLogs.reduce((sum, log) => sum + (log.career?.githubCommits || 0), 0);
    const totalStudyHours = dailyLogs.reduce((sum, log) => sum + (log.career?.studyHours || 0), 0) + dailyUpdates.reduce((sum, upd) => sum + (upd.career?.studyHours || 0), 0);
    
    const totalSteps = dailyLogs.reduce((sum, log) => sum + (log.health?.vitals?.steps || 0), 0);
    const totalSleepHours = dailyLogs.reduce((sum, log) => sum + (log.health?.sleepHours || 0), 0);
    const sleepLogsCount = dailyLogs.filter(log => log.health?.sleepHours > 0).length || 1;
    const avgSleep = parseFloat((totalSleepHours / sleepLogsCount).toFixed(1));
    const workoutCount = dailyLogs.reduce((sum, log) => sum + (log.health?.workouts?.length || 0), 0);

    const totalSpent = dailyLogs.reduce((sum, log) => sum + (log.finance?.moneySpent || 0), 0) + dailyUpdates.reduce((sum, upd) => sum + (upd.finance?.spending || 0), 0);
    const completedGoalsCount = smartGoals.filter(g => g.status === 'completed').length;
    const totalFocusSessions = dailyLogs.reduce((sum, log) => sum + (log.career?.studyHours > 0 ? 1 : 0), 0) + dailyUpdates.reduce((sum, upd) => sum + (upd.career?.studyHours > 0 ? 1 : 0), 0);
    const skippedOutings = dailyUpdates.reduce((sum, upd) => sum + (upd.health?.sleepHours > 7 ? 0 : 1), 0);

    const hasData = (careerLogCount + healthLogCount + financeLogCount + totalCommits) > 0;
    const timeBoundaryText = `Reflection based on your initial ${daysTracked} tracking days.`;
    
    // Choose theme title based on stats
    let fallbackTheme = "THE INITIATOR";
    if (totalCommits > 15) fallbackTheme = "THE BUILDER";
    else if (totalSteps > 50000) fallbackTheme = "THE OPTIMIZER";
    else if (totalSpent > 10000) fallbackTheme = "THE SURVIVOR";

    const demoFallback = {
      meta: {
        daysTracked,
        dataSourcesUsed
      },
      slides: [
        {
          slideId: 1,
          chapter: "CHAPTER 1: THE SYNTHESIS",
          layoutType: "verdict",
          heading: "Your Year in One Sentence",
          mainText: hasData ? "2026 was the year you sacrificed comfort for growth." : "Awaiting your first digital twin signal inputs.",
          narrative: hasData 
            ? `${timeBoundaryText} Pushing ${totalCommits || 0} commits and tracking study blocks defined your focus vector.` 
            : "No logs registered yet. Configure your career or wellness integrations.",
          visualTheme: { bgGradient: "from-[#09051b] via-[#12072b] to-[#04020d]", accent: "#a855f7", pattern: "cosmic" }
        },
        {
          slideId: 2,
          chapter: "CHAPTER 2: THE TRADE-OFFS",
          layoutType: "split",
          heading: "The Invisible Exchanges",
          gained: totalCommits > 0 ? ["GitHub Commits logged", "Technical study hours"] : ["Initial setup active", "Digital Twin created"],
          paidPrice: totalSleepHours > 0 ? [`Average sleep logged at ${avgSleep}h`, "Rest cycles skipped"] : ["System signals incomplete", "Biometric log gaps"],
          narrative: hasData 
            ? `Your career focus blocks aligned with ${avgSleep || 0}h sleep average, showing the direct trade-off between engineering speed and physical rest.`
            : "Connect Fitbit and GitHub to analyze physical vs productivity cost exchanges.",
          visualTheme: { bgGradient: "from-[#0c1a1a] via-[#022c22] to-[#01120d]", accent: "#10b981", pattern: "grid" }
        },
        {
          slideId: 3,
          chapter: "CHAPTER 3: THE CATALYST",
          layoutType: "ripple",
          heading: "The Ripple Effect",
          catalystEvent: totalCommits > 0 ? "GitHub Commits Streak" : totalSteps > 0 ? "Daily Steps Streak" : "System Initialization",
          rippleChain: totalCommits > 0 
            ? ["Pushed MERN backend commits", "Triggered smart goal progress sync", "Accelerated digital twin velocity"] 
            : ["Initial baseline created", "Integrations established", "Digital twin online"],
          narrative: hasData 
            ? "Your consistent data logs sparked direct metric updates across your Twin dashboards, driving focused goal progress."
            : "Configure Fitbit or log water intakes to review active catalyst ripple chains.",
          visualTheme: { bgGradient: "from-[#1e1b4b] via-[#0f172a] to-[#020617]", accent: "#3b82f6", pattern: "waves" }
        },
        {
          slideId: 4,
          chapter: "CHAPTER 4: THE SIMULATION",
          layoutType: "timeline",
          heading: "The Alternate Reality Avoided",
          projectedDrop: hasData ? "25% Productivity Decay" : "No Baseline Decay",
          narrative: hasData 
            ? `Your logs showed sleep levels averaging ${avgSleep}h. If this trend persisted without correction, your twin projects a 25% focus decline.`
            : "Establish data logs to run alternative timeline decay simulations.",
          visualTheme: { bgGradient: "from-[#3f0712] via-[#180206] to-[#0a0002]", accent: "#ef4444", pattern: "glitch" }
        },
        {
          slideId: 5,
          chapter: "CHAPTER 5: THE MANUAL",
          layoutType: "manual",
          heading: "Your Operating Manual",
          rules: {
            peakFocus: totalCommits > 0 ? "Morning blocks" : "Awaiting data",
            stressTrigger: totalSpent > 1000 ? "Erratic spending" : "Awaiting data"
          },
          narrative: "Your blueprint reveals peak activity loops. Optimize these focus blocks to protect physiological parameters.",
          visualTheme: { bgGradient: "from-[#111827] via-[#1f2937] to-[#111827]", accent: "#f3f4f6", pattern: "blueprint" }
        },
        {
          slideId: 6,
          chapter: "CHAPTER 6: THE IDENTITY",
          layoutType: "final",
          heading: "Your Core Identity Theme",
          themeTitle: fallbackTheme,
          narrative: `You evolved as ${fallbackTheme} over your ${daysTracked} tracked days, adjusting parameters and building career readiness.`,
          messageFromTwin: hasData 
            ? "Your twin values your choices. Let's align sleep and career blocks to conquer 2027."
            : "Voice of the Twin: Set up integrations to construct your playbook. Let's build your reflection.",
          visualTheme: { bgGradient: "from-[#0f052d] via-[#240b5c] to-[#09021a]", accent: "#f59e0b", pattern: "matrix" }
        }
      ]
    };

    const apiKey = process.env.GEMINI_API_KEY_INTELLIGENCE;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY_INTELLIGENCE not set, returning fallback...');
      return res.status(200).json({ success: true, data: demoFallback });
    }

    const genAI = getGenAIClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `
      You are the LifeTwin Reflection Engine.
      Your job is to completely analyze the user's digital twin database logs over up to 1 year and generate an optimized, highly stylized "Digital Twin Reflection" slide deck.
      
      User DB Ingest Metrics:
      - Days tracked: ${daysTracked}
      - Data sources: ${JSON.stringify(dataSourcesUsed)}
      - Health: ${totalSteps} steps, ${workoutCount} workouts, average sleep ${avgSleep}h. Active logs: ${healthLogCount}
      - Finance: ${totalSpent} total spent. Active logs: ${financeLogCount}
      - Career: ${totalCommits} GitHub commits, ${totalStudyHours}h study/focus. Active logs: ${careerLogCount}
      - Daily Update check-ins: ${dailyUpdates.length} logs
      - Document uploads: ${uploads.length} uploads
      - Active Goals: ${JSON.stringify(smartGoals)}
      - Life Profile: ${JSON.stringify(lifeProfile)}
      - Recent daily logs: ${JSON.stringify(dailyLogs.slice(-25))}

      CRITICAL CONSTRAINTS:
      1. STRICT DATA GROUNDING: Everything must be dynamically computed from the user's real logs. No filler text or fake stats. If the data is sparse, state "Reflection based on your initial ${daysTracked} tracking days."
      2. Rate-limit key: Initialize strictly via process.env.GEMINI_API_KEY_INTELLIGENCE.
      3. Brand isolation: ZERO references to any third-party brands.
      4. Captions: Make narratives punchy, minimal, and highly stylized.

      You MUST output ONLY a valid, raw JSON object (with NO markdown formatting, no backticks) structured EXACTLY like this:
      {
        "meta": {
          "daysTracked": ${daysTracked}
        },
        "slides": [
          {
            "slideId": 1,
            "chapter": "CHAPTER 1: THE SYNTHESIS",
            "layoutType": "verdict",
            "heading": "Your Year in One Sentence",
            "mainText": "e.g., '2026 was the year you sacrificed comfort for growth.'",
            "narrative": "A deep, personal analytical sentence justifying this verdict by linking their real project grinds (like Grabyourmeal or TradePulse) to their resting patterns.",
            "visualTheme": { "bgGradient": "from-[#09051b] via-[#12072b] to-[#04020d]", "accent": "#a855f7", "pattern": "cosmic" }
          },
          {
            "slideId": 2,
            "chapter": "CHAPTER 2: THE TRADE-OFFS",
            "layoutType": "split",
            "heading": "The Invisible Exchanges",
            "gained": ["list of 2 real positive metrics from DB, e.g., 'Enhanced MERN velocity', 'Disciplined career readiness'"],
            "paidPrice": ["list of 2 real costs from DB, e.g., '14.5 hours of sacrificed deep sleep', 'Reduced baseline recovery loops'"],
            "narrative": "A sophisticated text explaining the systemic trade-off: how optimizing one area silently bled resources from another.",
            "visualTheme": { "bgGradient": "from-[#0c1a1a] via-[#022c22] to-[#01120d]", "accent": "#10b981", "pattern": "grid" }
          },
          {
            "slideId": 3,
            "chapter": "CHAPTER 3: THE CATALYST",
            "layoutType": "ripple",
            "heading": "The Ripple Effect",
            "catalystEvent": "Pinpoint ONE highly influential habit or event from the logs (e.g., a consistent walking streak or a massive Git commit push phase)",
            "rippleChain": ["Step 1", "Step 2", "Step 3"],
            "narrative": "Explains how this single habit triggered a cascading domino effect that positively spiked focus, health parameters, or project completion rates across other domains.",
            "visualTheme": { "bgGradient": "from-[#1e1b4b] via-[#0f172a] to-[#020617]", "accent": "#3b82f6", "pattern": "waves" }
          },
          {
            "slideId": 4,
            "chapter": "CHAPTER 4: THE SIMULATION",
            "layoutType": "timeline",
            "heading": "The Alternate Reality Avoided",
            "projectedDrop": "e.g., '28% Productivity Decay'",
            "narrative": "Digital Twin simulation narrative: Identifies a negative behavioral dip in their history (like a high-expense or zero-sleep week) and projects what their twin evolution would look like if that trajectory hadn't been corrected.",
            "visualTheme": { "bgGradient": "from-[#3f0712] via-[#180206] to-[#0a0002]", "accent": "#ef4444", "pattern": "glitch" }
          },
          {
            "slideId": 5,
            "chapter": "CHAPTER 5: THE MANUAL",
            "layoutType": "manual",
            "heading": "Your Operating Manual",
            "rules": {
              "peakFocus": "Real computed time block from data or manual updates",
              "stressTrigger": "Real cross-domain friction moment found"
            },
            "narrative": "The operating rulebook extracted from their behaviors: revealing exactly how they learn, when they crack, and what triggers their highest performance.",
            "visualTheme": { "bgGradient": "from-[#111827] via-[#1f2937] to-[#111827]", "accent": "#f3f4f6", "pattern": "blueprint" }
          },
          {
            "slideId": 6,
            "chapter": "CHAPTER 6: THE IDENTITY",
            "layoutType": "final",
            "heading": "Your Core Identity Theme",
            "themeTitle": "THE BUILDER / THE EXPLORER / THE SURVIVOR / THE OPTIMIZER",
            "narrative": "A highly memorable, empowering concluding statement analyzing who they became this year.",
            "messageFromTwin": "A direct, emotional sign-off statement written as the Voice of the Digital Twin reflecting on their choices and guiding their 2027 entry point.",
            "visualTheme": { "bgGradient": "from-[#0f052d] via-[#240b5c] to-[#09021a]", "accent": "#f59e0b", "pattern": "matrix" }
          }
        ]
      }
    `;

    let result;
    try {
      result = await model.generateContent(systemPrompt);
    } catch (apiError) {
      console.warn('⚠️ Gemini reflection request failed, returning fallback:', apiError.message);
      return res.status(200).json({ success: true, data: demoFallback });
    }

    const responseText = result?.response?.text()?.trim();
    if (!responseText) {
      return res.status(200).json({ success: true, data: demoFallback });
    }

    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    res.status(200).json({ success: true, data: parsedData });

  } catch (error) {
    console.error('Reflection Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server Error building reflection.' });
  }
};

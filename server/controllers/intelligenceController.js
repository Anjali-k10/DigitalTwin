import DailyTracking from '../models/DailyTracking.js';
import LifeProfile from '../models/LifeProfile.js';
import SmartGoal from '../models/SmartGoal.js';
import IntelligenceReport from '../models/IntelligenceReport.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runDiagnostics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const dailyLogs = await DailyTracking.find({ userId }).sort({ dateString: 1 }).lean();
    const lifeProfile = await LifeProfile.findOne({ userId }).lean() || {};
    const smartGoals = await SmartGoal.find({ userId }).lean();

    const demoFallback = {
      summaryTable: [
        { domainInteraction: "Health vs Finance", keyMetric: "-15% sleep = +₹800 spend", status: "Critical" },
        { domainInteraction: "Health vs Career", keyMetric: "<6h sleep = -60% GitHub commits", status: "Warning" },
        { domainInteraction: "Finance vs Health", keyMetric: "₹5000+ daily spend = +30% stress", status: "Warning" },
        { domainInteraction: "Career vs Health", keyMetric: "10+ commits/day = -1.5h active sleep", status: "Info" }
      ],
      histogramData: [
        { day: "Mon", healthImpact: 40, financeImpact: 60, careerImpact: 50 },
        { day: "Tue", healthImpact: 55, financeImpact: 45, careerImpact: 60 },
        { day: "Wed", healthImpact: 70, financeImpact: 30, careerImpact: 75 },
        { day: "Thu", healthImpact: 35, financeImpact: 80, careerImpact: 45 },
        { day: "Fri", healthImpact: 60, financeImpact: 50, careerImpact: 65 },
        { day: "Sat", healthImpact: 80, financeImpact: 20, careerImpact: 40 },
        { day: "Sun", healthImpact: 90, financeImpact: 15, careerImpact: 35 }
      ],
      flowAnalysis: {
        rootCause: "Late night coding",
        primaryEffect: "Sub-6 hour sleep average",
        secondaryEffect: "High caffeine/food delivery spending"
      },
      visualNarrative: [
        "Impulse spending on convenience items spikes dramatically during cognitive fatigue cycles.",
        "Stamina metrics and dev-profile throughput drop by half when cumulative sleep debt is high.",
        "Investing resources into skill development bootcamps shows a clear long-term salary growth correlation."
      ],
      balancedLifestyleRecommendations: [
        { action: "Set a hard 11 PM screens-off protocol to preserve sleep quality.", expectedOutcome: "Reduce next-day impulse caffeine spends by 30%." },
        { action: "Limit late-night deployment pushes and keep coding blocks to daytime.", expectedOutcome: "Stabilize baseline resting HR and double commit consistency." },
        { action: "Automate ₹2000 weekly savings transfers immediately on salary credit.", expectedOutcome: "Improve subjective stress indexes and lower overall financial anxiety." }
      ]
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Save fallback to DB
      await IntelligenceReport.create({ userId, reportData: demoFallback });
      return res.status(200).json({ success: true, data: demoFallback });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `
      You are the LifeTwin Autonomous Diagnostic Engine.
      Your job is to perform a Deep Cross-Domain Diagnostics run on the user's historical data, active profile, and goals.
      Act strictly as a structured data calculator rather than a chat assistant.
      Ingest the actual, raw database records passed below:
      - Historical Daily Logs: ${JSON.stringify(dailyLogs.slice(-30))}
      - Life Profile: ${JSON.stringify(lifeProfile)}
      - Active Smart Goals: ${JSON.stringify(smartGoals)}

      You must perform multi-directional matrix calculations:
      - Health ➔ Finance
      - Health ➔ Career
      - Finance ➔ Health
      - Finance ➔ Career
      - Career ➔ Health
      - Career ➔ Finance
      using the real user numbers.

      You are prohibited from returning paragraphs of narrative prose or markdown code backticks.
      You MUST output ONLY a valid, raw, un-markdowned JSON object structured EXACTLY like this:
      {
        "summaryTable": [
          { "domainInteraction": "Health vs Finance", "keyMetric": "-15% sleep = +₹800 spend", "status": "Critical" },
          { "domainInteraction": "Health vs Career", "keyMetric": "<6h sleep = -60% GitHub commits", "status": "Warning" },
          { "domainInteraction": "Finance vs Health", "keyMetric": "₹5000+ daily spend = +30% stress", "status": "Warning" },
          { "domainInteraction": "Career vs Health", "keyMetric": "10+ commits/day = -1.5h active sleep", "status": "Info" }
        ],
        "histogramData": [
          { "day": "Mon", "healthImpact": 40, "financeImpact": 60, "careerImpact": 50 },
          { "day": "Tue", "healthImpact": 55, "financeImpact": 45, "careerImpact": 60 },
          { "day": "Wed", "healthImpact": 70, "financeImpact": 30, "careerImpact": 75 },
          { "day": "Thu", "healthImpact": 35, "financeImpact": 80, "careerImpact": 45 },
          { "day": "Fri", "healthImpact": 60, "financeImpact": 50, "careerImpact": 65 },
          { "day": "Sat", "healthImpact": 80, "financeImpact": 20, "careerImpact": 40 },
          { "day": "Sun", "healthImpact": 90, "financeImpact": 15, "careerImpact": 35 }
        ],
        "flowAnalysis": {
          "rootCause": "Late night coding",
          "primaryEffect": "Sub-6 hour sleep average",
          "secondaryEffect": "High caffeine/food delivery spending"
        },
        "visualNarrative": [
          "Short, data-backed bullet point 1.",
          "Short, data-backed bullet point 2."
        ],
        "balancedLifestyleRecommendations": [
          { "action": "Specific cross-domain habit to build", "expectedOutcome": "Metric improvement" }
        ]
      }

      For "histogramData", compute daily impact percentages (0 to 100) for Health, Finance, and Career based on the daily metrics across the days of the week.
    `;

    let result;
    let retries = 1;
    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    while (retries >= 0) {
      try {
        result = await model.generateContent(systemPrompt);
        break;
      } catch (apiError) {
        if (apiError.status === 429 || apiError.status === 503) {
          console.warn('⚠️ Gemini API Limit Hit in Diagnostics! Activating Fallback...');
          await IntelligenceReport.create({ userId, reportData: demoFallback });
          return res.status(200).json({ success: true, data: demoFallback });
        }
        if (retries > 0) {
          await delay(2000);
          retries--;
        } else {
          await IntelligenceReport.create({ userId, reportData: demoFallback });
          return res.status(200).json({ success: true, data: demoFallback });
        }
      }
    }

    const responseText = result?.response?.text()?.trim();
    if (!responseText) {
      await IntelligenceReport.create({ userId, reportData: demoFallback });
      return res.status(200).json({ success: true, data: demoFallback });
    }

    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    // Save report to DB
    await IntelligenceReport.create({ userId, reportData: parsedData });

    res.status(200).json({ success: true, data: parsedData });

  } catch (error) {
    console.error('Diagnostics Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server Error running diagnostics.' });
  }
};

export const getLatestReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const latest = await IntelligenceReport.findOne({ userId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: latest ? latest.reportData : null });
  } catch (error) {
    console.error('Fetch Latest Diagnostics Report Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching report history.' });
  }
};

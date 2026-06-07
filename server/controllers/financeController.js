import GamificationEngine from '../services/GamificationEngine.js';
import DailyTracking from '../models/DailyTracking.js';
import Upload from '../models/Upload.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  buildTrajectory,
  getLatestOnboardingProfile,
  getOrCreateDailyTracking,
  getOrCreateLifeProfile,
  scoreFromParts,
  todayKey,
} from '../services/domainDataService.js';

export const getFinance = async (req, res) => {
  const [daily, lifeProfile, onboarding] = await Promise.all([
    getOrCreateDailyTracking(req.user.userId),
    getOrCreateLifeProfile(req.user.userId),
    getLatestOnboardingProfile(req.user.userId),
  ]);

  res.status(200).json({
    success: true,
    data: {
      daily: daily.finance,
      profile: lifeProfile.financeContext,
      onboarding: {
        monthlyIncome: onboarding?.monthlyIncome || 0,
        monthlyExpenditure: onboarding?.monthlyExpenditure || 0,
        savingsHabit: onboarding?.savingsHabit || '',
      },
    },
  });
};

export const createFinance = async (req, res) => {
  const daily = await getOrCreateDailyTracking(req.user.userId, req.body.dateString || todayKey());
  daily.finance = { ...daily.finance, ...req.body };
  await daily.save();
  res.status(201).json({ success: true, data: daily.finance });
};

export const updateFinance = async (req, res) => {
  const daily = await getOrCreateDailyTracking(req.user.userId, req.body.dateString || todayKey());
  daily.finance = { ...daily.finance, ...req.body };
  await daily.save();
  res.status(200).json({ success: true, data: daily.finance });
};

export const getFinanceAnalytics = async (req, res) => {
  const logs = await DailyTracking.find({ userId: req.user.userId }).sort({ dateString: -1 }).limit(30).lean();
  const spent = logs.reduce((sum, log) => sum + (log.finance?.moneySpent || 0), 0);
  const credited = logs.reduce((sum, log) => sum + (log.finance?.moneyCredited || 0), 0);
  const score = scoreFromParts([credited > 0 ? Math.max(0, 100 - (spent / credited) * 100) : 60]);

  res.status(200).json({
    success: true,
    data: {
      score,
      spent,
      credited,
      net: credited - spent,
      transactions: logs.flatMap((log) => log.finance?.transactions || []),
    },
  });
};

export const getFinanceTrajectory = async (req, res) => {
  const logs = await DailyTracking.find({ userId: req.user.userId }).sort({ dateString: 1 }).limit(60).lean();
  res.status(200).json({ success: true, data: buildTrajectory(logs) });
};

export const getDocumentFinanceIntelligence = async (req, res) => {
  const userId = req.user.userId;
  const uploads = await Upload.find({ userId, domain: 'finance' }).sort({ createdAt: 1 }).limit(50).lean();

  if (uploads.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        status: 'empty',
        documentCount: 0,
        records: [],
        categoryAnalysis: [],
        spikes: [],
        insights: [],
        message: 'No financial history available yet.',
        detail: 'Upload bills, receipts, or financial documents to detect unusual spending patterns.',
      },
    });
  }

  const records = uploads.flatMap((upload) => extractFinanceRecords(upload));

  if (uploads.length === 1) {
    return res.status(200).json({
      success: true,
      data: {
        status: 'insufficient',
        documentCount: uploads.length,
        records,
        categoryAnalysis: [],
        spikes: [],
        insights: [],
        message: 'More spending history is needed before unusual spending can be detected.',
        detail: 'Need at least 2-3 finance records for comparison.',
      },
    });
  }

  const latestUpload = uploads[uploads.length - 1];
  const previousUploads = uploads.slice(0, -1);
  const latestRecords = extractFinanceRecords(latestUpload).filter((record) => record.type !== 'income');
  const previousRecordGroups = previousUploads.map((upload) => extractFinanceRecords(upload).filter((record) => record.type !== 'income'));
  const categoryAnalysis = buildCategoryAnalysis(latestRecords, previousRecordGroups);
  const savings = buildSavingsSignal(uploads);
  const investments = buildInvestmentSignal(uploads);
  const insights = await buildFinanceInsightsWithGemini({
    categoryAnalysis,
    savings,
    investments,
    documentCount: uploads.length,
  });

  res.status(200).json({
    success: true,
    data: {
      status: 'ready',
      documentCount: uploads.length,
      records,
      categoryAnalysis,
      spikes: categoryAnalysis.filter((item) => item.severity !== 'Normal'),
      insights,
      savings,
      investments,
    },
  });
};

const generateMarketAnalysisWithTiers = async (genAI, systemPrompt, retries = 2) => {
  try {
    // Tier 1: Try with googleSearch grounding
    const modelWithSearch = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }]
    });
    const result = await modelWithSearch.generateContent(systemPrompt);
    return result.response.text();
  } catch (err) {
    console.warn(`⚠️ [MarketAnalysis] Tier 1 Google Search Grounding failed (${err.message}). Trying Tier 2 (Standard Gemini)...`);
    
    try {
      // Tier 2: Try standard model (no search grounding, much higher success rate)
      const modelStandard = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash' 
      });
      const result = await modelStandard.generateContent(systemPrompt);
      return result.response.text();
    } catch (err2) {
      if (retries > 0 && (err2.status === 503 || err2.status === 429)) {
        console.warn(`⚠️ [MarketAnalysis] Gemini busy. Retrying standard call in 2 seconds... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return generateMarketAnalysisWithTiers(genAI, systemPrompt, retries - 1);
      }
      throw err2;
    }
  }
};

function extractFinanceRecords(upload) {
  const finance = upload.extractedData?.financeData || {};
  const transactions = Array.isArray(finance.transactions) ? finance.transactions : [];
  const records = transactions
    .map((transaction) => ({
      documentId: String(upload._id),
      fileName: upload.fileName,
      date: normalizeRecordDate(transaction.date || upload.createdAt),
      category: normalizeFinanceCategory(transaction.category),
      amount: positiveNumber(transaction.amount),
      type: transaction.type === 'income' ? 'income' : 'expense',
    }))
    .filter((record) => record.amount > 0);

  if (!records.length && positiveNumber(finance.moneySpent) > 0) {
    records.push({
      documentId: String(upload._id),
      fileName: upload.fileName,
      date: normalizeRecordDate(upload.createdAt),
      category: inferCategoryFromFileName(upload.fileName),
      amount: positiveNumber(finance.moneySpent),
      type: 'expense',
    });
  }

  if (positiveNumber(finance.moneyCredited) > 0) {
    records.push({
      documentId: String(upload._id),
      fileName: upload.fileName,
      date: normalizeRecordDate(upload.createdAt),
      category: 'Income',
      amount: positiveNumber(finance.moneyCredited),
      type: 'income',
    });
  }

  return records;
}

function buildCategoryAnalysis(latestRecords, previousRecordGroups) {
  const latestByCategory = sumRecordsByCategory(latestRecords);
  return Object.entries(latestByCategory)
    .map(([category, current]) => {
      const historicalTotals = previousRecordGroups
        .map((group) => sumRecordsByCategory(group)[category] || 0)
        .filter((amount) => amount > 0);
      if (!historicalTotals.length) return null;

      const average = historicalTotals.reduce((sum, amount) => sum + amount, 0) / historicalTotals.length;
      const difference = current - average;
      const changePct = average > 0 ? Math.round((difference / average) * 100) : 0;
      const severity = getSpikeSeverity(changePct);

      return {
        category,
        average: Math.round(average),
        current: Math.round(current),
        difference: Math.round(difference),
        changePct,
        severity,
        title: severity === 'Unusual Spending Spike'
          ? `Unusual ${category} Spending Detected`
          : `${category} Spending ${severity}`,
        description: buildSpikeDescription(category, difference, severity),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.changePct - a.changePct);
}

function sumRecordsByCategory(records) {
  return records.reduce((totals, record) => {
    totals[record.category] = (totals[record.category] || 0) + record.amount;
    return totals;
  }, {});
}

function getSpikeSeverity(changePct) {
  if (changePct < 20) return 'Normal';
  if (changePct <= 50) return 'Moderate Increase';
  if (changePct <= 100) return 'High Increase';
  return 'Unusual Spending Spike';
}

function buildSpikeDescription(category, difference, severity) {
  if (severity === 'Normal') {
    return `${category} spending is within your recent spending pattern.`;
  }
  const absDifference = Math.max(0, Math.round(difference));
  return `${category} expenses increased by Rs ${absDifference.toLocaleString('en-IN')} compared to your normal spending pattern.`;
}

function buildSavingsSignal(uploads) {
  const perDocument = uploads.map((upload) => {
    const records = extractFinanceRecords(upload);
    const income = records.filter((record) => record.type === 'income').reduce((sum, record) => sum + record.amount, 0);
    const expenses = records.filter((record) => record.type !== 'income').reduce((sum, record) => sum + record.amount, 0);
    return { date: normalizeRecordDate(upload.createdAt), savings: Math.round(income - expenses), income: Math.round(income), expenses: Math.round(expenses) };
  });
  const current = perDocument.at(-1)?.savings || 0;
  const previous = perDocument.length > 1 ? perDocument.slice(0, -1).reduce((sum, item) => sum + item.savings, 0) / (perDocument.length - 1) : 0;
  return { current, previousAverage: Math.round(previous), difference: Math.round(current - previous), perDocument };
}

function buildInvestmentSignal(uploads) {
  const perDocument = uploads.map((upload) => {
    const finance = upload.extractedData?.financeData || {};
    const holdingsValue = Array.isArray(finance.holdings)
      ? finance.holdings.reduce((sum, holding) => sum + positiveNumber(holding.value), 0)
      : 0;
    return {
      date: normalizeRecordDate(upload.createdAt),
      value: Math.round(positiveNumber(finance.portfolioValue) || holdingsValue),
    };
  });
  const current = perDocument.at(-1)?.value || 0;
  const previous = perDocument.length > 1 ? perDocument.slice(0, -1).reduce((sum, item) => sum + item.value, 0) / (perDocument.length - 1) : 0;
  return { current, previousAverage: Math.round(previous), difference: Math.round(current - previous), perDocument };
}

async function buildFinanceInsightsWithGemini(signals) {
  const fallback = buildGroundedFinanceInsights(signals);
  if (!process.env.GEMINI_API_KEY) return fallback;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
You are LifeTwin Finance Cross Intelligence.
Generate 3-5 concise actionable insights from ONLY the finance data below.
Every insight must reference an actual category, percentage, rupee amount, savings value, or investment value from the data.
Do not invent categories. Do not give generic advice. Return ONLY raw JSON:
{ "insights": ["short insight", "short insight"] }

Finance signals:
${JSON.stringify({
  spendingCategories: signals.categoryAnalysis.map(({ category, average, current, difference, changePct, severity }) => ({ category, historicalAverage: average, currentExpense: current, difference, changePct, severity })),
  savings: signals.savings,
  investments: signals.investments,
  documentCount: signals.documentCount,
})}
`;
    const result = await model.generateContent(prompt);
    const cleaned = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const insights = Array.isArray(parsed.insights) ? parsed.insights.map((item) => String(item).trim()).filter(Boolean).slice(0, 5) : [];
    return insights.length ? insights : fallback;
  } catch (error) {
    console.warn('[FinanceIntelligence] Gemini insight generation failed:', error.message);
    return fallback;
  }
}

function buildGroundedFinanceInsights(signals) {
  const insights = [];
  signals.categoryAnalysis
    .filter((item) => item.severity !== 'Normal')
    .slice(0, 3)
    .forEach((item) => {
      insights.push(`${item.category} expenses increased by ${item.changePct}% compared to your recent average of Rs ${item.average.toLocaleString('en-IN')}.`);
    });

  if (signals.savings.difference > 0) {
    insights.push(`Savings improved by Rs ${signals.savings.difference.toLocaleString('en-IN')} over the previous period.`);
  } else if (signals.savings.difference < 0) {
    insights.push(`Savings declined by Rs ${Math.abs(signals.savings.difference).toLocaleString('en-IN')} compared to previous records.`);
  }

  if (signals.investments.difference > 0) {
    insights.push(`Investment activity increased by Rs ${signals.investments.difference.toLocaleString('en-IN')}.`);
  } else if (signals.investments.current > 0) {
    insights.push(`Investment activity remains stable at Rs ${signals.investments.current.toLocaleString('en-IN')}.`);
  }

  return insights.slice(0, 5);
}

function normalizeFinanceCategory(value) {
  const raw = String(value || '').toLowerCase();
  if (/food|dining|restaurant|delivery|grocery|swiggy|zomato/.test(raw)) return 'Food';
  if (/cloth|apparel|fashion|shirt|shoe/.test(raw)) return 'Clothing';
  if (/travel|flight|hotel|cab|taxi|fuel|train/.test(raw)) return 'Travel';
  if (/entertain|movie|netflix|ott|game/.test(raw)) return 'Entertainment';
  if (/health|medical|pharmacy|doctor|hospital/.test(raw)) return 'Healthcare';
  if (/education|course|tuition|book|bootcamp/.test(raw)) return 'Education';
  if (/invest|stock|share|mutual|fund|portfolio|lic|insurance/.test(raw)) return 'Investment';
  if (/shop|purchase|retail|amazon|flipkart/.test(raw)) return 'Shopping';
  return titleCase(raw.replace(/[^a-z0-9 ]/g, ' ').trim() || 'Shopping');
}

function inferCategoryFromFileName(fileName = '') {
  return normalizeFinanceCategory(fileName);
}

function normalizeRecordDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return todayKey();
  return date.toISOString().split('T')[0];
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function titleCase(value) {
  return String(value || '').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const getMarketAnalysis = async (req, res) => {
  try {
    const userId = req.user.userId;
    const latestLog = await DailyTracking.findOne({
      userId,
      'finance.holdings.0': { $exists: true }
    }).sort({ dateString: -1 }).lean();

    const holdings = latestLog?.finance?.holdings || [];
    const holdingsSummary = holdings.map(h => `${h.shares || 1} units of ${h.assetName} (value: ₹${h.value})`).join(', ') || 'No custom shares/LIC policies yet';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return returnFallbackAnalysis(res, holdings);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemPrompt = `
      You are the LifeTwin Autonomous Macro Financial Analyst.
      Your task is to analyze the user's asset holdings and generate 4 realistic, personalized market impact analysis reports.
      You must look for current global financial events, geopolitical shifts, and regulatory changes (e.g. interest rate adjustments, inflation, regional conflicts, tax amendments) and explain how they specifically affect the user's holdings.
      
      USER'S HOLDINGS:
      ${holdingsSummary}
      
      Return ONLY a valid raw JSON object (no markdown, no backticks, no text wrappers).
      
      JSON STRUCTURE REQUIRED:
      {
        "sentiment": "bullish" | "bearish" | "neutral",
        "riskLevel": number (1 to 10),
        "recommendation": "1-sentence strategic action advice tailored to the user's holdings.",
        "impacts": [
          {
            "title": "Geopolitical / War Impact",
            "detail": "A realistic explanation of current conflicts (e.g. energy supply changes due to Middle East tension) and how it affects the user's holdings or general market.",
            "type": "danger" | "warning" | "info"
          },
          {
            "title": "Law & Tax Amendments",
            "detail": "A realistic tax or capital gains rule update (e.g., changes to savings brackets, insurance policies) and its impact.",
            "type": "danger" | "warning" | "info"
          },
          {
            "title": "Political / Policy Shifts",
            "detail": "A realistic political update (e.g., inflation policy, central bank rates) and its effect.",
            "type": "danger" | "warning" | "info"
          },
          {
            "title": "General Market Update",
            "detail": "A realistic update summarizing general stock volatility, index funds, or general asset advice.",
            "type": "danger" | "warning" | "info"
          }
        ]
      }
    `;

    const text = await generateMarketAnalysisWithTiers(genAI, systemPrompt);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.status(200).json({ success: true, data: parsed });

  } catch (apiError) {
    console.warn('⚠️ Gemini API error in Market Analysis, using fallback:', apiError.message);
    const latestLog = await DailyTracking.findOne({
      userId: req.user.userId,
      'finance.holdings.0': { $exists: true }
    }).sort({ dateString: -1 }).lean();
    return returnFallbackAnalysis(res, latestLog?.finance?.holdings || []);
  }
};

function returnFallbackAnalysis(res, holdings) {
  const hasLic = holdings.some(h => h.assetName?.toLowerCase() === 'lic' || h.assetName?.toLowerCase().includes('insurance'));
  const hasShares = holdings.some(h => h.assetName?.toLowerCase() !== 'lic' && !h.assetName?.toLowerCase().includes('insurance'));
  
  res.status(200).json({
    success: true,
    data: {
      sentiment: 'neutral',
      riskLevel: 5,
      recommendation: hasShares ? 'Monitor tech index benchmarks before expanding equity exposure.' : 'Maintain a stable cash reserve before allocating towards high-risk assets.',
      impacts: [
        {
          title: "Geopolitical Conflict / War Risks",
          detail: "Supply chain disruptions detected in energy sectors. Expect minor inflationary pressure on regional utility and fuel costs.",
          type: "danger"
        },
        {
          title: "Tax Law Amendments",
          detail: hasLic ? "New rules on insurance policy yield taxation under review. LIC policies remain stable long-term instruments." : "Capital gains structure adjustments under review. Short-term transaction adjustments recommended.",
          type: "warning"
        },
        {
          title: "Political / Policy Shifts",
          detail: "Central bank interest rate decisions expected next week. High-yield savings accounts are recommended for liquidity retention.",
          type: "info"
        },
        {
          title: "General Market Update",
          detail: "Tech indexing and defense assets show stable returns. Diversified index allocations are suggested.",
          type: "info"
        }
      ]
    }
  });
}

export const logExpense = async (req, res) => {
  try {
    // ✅ FIXED: Your auth.js uses .userId!
    const userId = req.user.userId; 
    const { amount, description } = req.body;

    const gamificationResult = await GamificationEngine.logEvent(
      userId, 
      'EXPENSE_LOGGED', 
      { amount, description, addedValue: Number(amount) || 1 }
    );

    res.status(201).json({
      success: true,
      message: 'Expense logged successfully!',
      gamification: gamificationResult 
    });

  } catch (error) {
    console.error('Finance Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

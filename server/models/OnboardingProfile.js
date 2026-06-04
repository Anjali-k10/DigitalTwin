import mongoose from 'mongoose';

const onboardingProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    selectedSignals: {
      type: [String],
      default: [],
    },
    githubUsername: {
      type: String,
      trim: true,
      default: '',
    },
    leetcodeUsername: {
      type: String,
      trim: true,
      default: '',
    },
    fitbitProfile: {
      type: String,
      trim: true,
      default: '',
    },
    calendarProfile: {
      type: String,
      trim: true,
      default: '',
    },
    linkedinProfile: {
      type: String,
      trim: true,
      default: '',
    },
    githubData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    leetcodeData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    linkedinData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    careerInsights: {
      type: [
        {
          label: { type: String, trim: true },
          message: { type: String, trim: true },
          source: { type: String, trim: true, default: 'career' },
          severity: { type: String, trim: true, default: 'low' },
          colorState: { type: String, trim: true, default: 'green' },
        },
      ],
      default: [],
    },
    codingConsistency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    careerMomentum: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    professionalGrowthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    bankingProfile: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['female', 'male', ''],
      default: '',
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
      default: 7,
    },
    studyHours: {
      type: Number,
      min: 0,
      max: 24,
      default: 4,
    },
    exerciseFrequency: {
      type: Number,
      min: 0,
      max: 7,
      default: 2,
    },
    spendingStyle: {
      type: String,
      trim: true,
      default: 'balanced',
    },
    smokingHabit: {
      type: String,
      trim: true,
      default: 'no',
    },
    periodTracking: {
      type: String,
      trim: true,
      default: 'not_now',
    },
    genderSpecificHealthContext: {
      type: String,
      trim: true,
      default: 'not_now',
    },
    monthlyIncome: {
      type: Number,
      min: 0,
      default: 0,
    },
    monthlyExpenditure: {
      type: Number,
      min: 0,
      default: 0,
    },
    savingsHabit: {
      type: String,
      trim: true,
      default: 'moderate',
    },
    financialStressLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    burnoutRisk: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    productivityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    financialHealth: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    wellnessBalance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    currentStreak: {
      type: Number,
      min: 0,
      default: 0,
    },
    streakStarted: {
      type: Boolean,
      default: false,
    },
    lastGoalCompletionDate: {
      type: String,
      trim: true,
      default: '',
    },
    completedDailyGoals: {
      type: [
        {
          date: { type: String, trim: true, required: true },
          goals: { type: [String], default: [] },
          goalCompleted: { type: Boolean, default: true },
          completed: { type: Boolean, default: true },
          completedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    recommendations: {
      type: [
        {
          title: { type: String, trim: true },
          detail: { type: String, trim: true },
          category: { type: String, trim: true, default: 'general' },
          severity: { type: String, trim: true, default: 'low' },
          colorState: { type: String, trim: true, default: 'green' },
          highlightedProblemTags: { type: [String], default: [] },
        },
      ],
      default: [],
    },
    aiInsights: {
      type: [
        {
          label: { type: String, trim: true },
          message: { type: String, trim: true },
          score: { type: Number, default: null },
          status: { type: String, trim: true, default: 'healthy' },
          severity: { type: String, trim: true, default: 'low' },
          colorState: { type: String, trim: true, default: 'green' },
          sentiment: { type: String, trim: true, default: 'neutral' },
          highlightedProblemTags: { type: [String], default: [] },
        },
      ],
      default: [],
    },
    thresholdStates: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    correlationAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    aiSource: {
      type: String,
      enum: ['flask', 'fallback', 'mixed'],
      default: 'fallback',
    },
  },
  {
    timestamps: true,
  }
);

onboardingProfileSchema.index({ userId: 1, updatedAt: -1 });

const OnboardingProfile = mongoose.model('OnboardingProfile', onboardingProfileSchema);

export default OnboardingProfile;

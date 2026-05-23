import express from 'express';
import { completeDailyGoals, getDashboardProfile, saveOnboardingProfile } from '../controllers/onboardingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/onboarding', authenticateToken, saveOnboardingProfile);
router.get('/dashboard', authenticateToken, getDashboardProfile);
router.post('/daily-goals/complete', authenticateToken, completeDailyGoals);

export default router;

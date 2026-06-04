import express from 'express';
import {
  createDailyUpdate,
  getDailyUpdateHistory,
  getStreakCalendar,
  getTodayDailyUpdate,
} from '../controllers/dailyUpdateController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/today', authenticateToken, asyncHandler(getTodayDailyUpdate));
router.post('/', authenticateToken, asyncHandler(createDailyUpdate));
router.get('/history', authenticateToken, asyncHandler(getDailyUpdateHistory));

export const streakRouter = express.Router();
streakRouter.get('/calendar', authenticateToken, asyncHandler(getStreakCalendar));

export default router;

import express from 'express';
import {
  getNotificationCount,
  getNotifications,
  sendTestEmailNotification,
  updateNotifications,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/', authenticateToken, asyncHandler(getNotifications));
router.get('/count', authenticateToken, asyncHandler(getNotificationCount));
router.post('/test-email', authenticateToken, asyncHandler(sendTestEmailNotification));
router.put('/', authenticateToken, asyncHandler(updateNotifications));

export default router;

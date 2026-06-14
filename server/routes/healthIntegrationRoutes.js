import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  deleteHealthIntegration,
  getHealthIntegration,
  updateHealthIntegration,
  getHealthMetrics,
} from '../controllers/healthIntegrationController.js';

const router = express.Router();

router.get('/', authenticateToken, asyncHandler(getHealthIntegration));
router.post('/', authenticateToken, asyncHandler(updateHealthIntegration));
router.delete('/', authenticateToken, asyncHandler(deleteHealthIntegration));
router.get('/metrics', authenticateToken, asyncHandler(getHealthMetrics));

export default router;

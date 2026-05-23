import express from 'express';
import { getGithubIntegration, getLeetcodeIntegration, postLinkedinIntegration } from '../controllers/integrationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/github/:username', authenticateToken, getGithubIntegration);
router.get('/leetcode/:username', authenticateToken, getLeetcodeIntegration);
router.post('/linkedin', authenticateToken, postLinkedinIntegration);

export default router;

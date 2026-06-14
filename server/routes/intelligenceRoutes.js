import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDocumentary } from '../controllers/intelligenceController.js';
import { getTwinReflection } from '../controllers/twinReflectionController.js';

const router = express.Router();

router.get('/documentary', authenticateToken, getDocumentary);
router.get('/reflection', authenticateToken, getTwinReflection);

export default router;

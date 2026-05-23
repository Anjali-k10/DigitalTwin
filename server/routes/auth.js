import express from 'express';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * PUBLIC ROUTES
 */

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 * @body    { firstName, lastName, email, password, confirmPassword }
 */
router.post('/signup', asyncHandler(signup));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', asyncHandler(login));

/**
 * PROTECTED ROUTES (Require Authentication)
 */

/**
 * @route   GET /api/auth/profile
 * @desc    Get authenticated user's profile
 * @access  Private
 */
router.get('/profile', authenticateToken, asyncHandler(getProfile));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 * @body    { firstName, lastName, bio, phone, language, timezone, notifications }
 */
router.put('/profile', authenticateToken, asyncHandler(updateProfile));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @body    { oldPassword, newPassword, confirmPassword }
 */
router.post('/change-password', authenticateToken, asyncHandler(changePassword));

export default router;

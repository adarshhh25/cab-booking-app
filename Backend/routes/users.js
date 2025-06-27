import express from 'express';
import userService from '../services/userService.js';
import { authenticateToken, checkResourceOwnership, optionalAuth } from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validateAddAddress,
  validatePreferences,
  validatePasswordChange,
  validateUserId,
  handleValidationErrors
} from '../middleware/userValidation.js';

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  validateUserRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await userService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }
);

// @route   POST /api/users/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login',
  validateUserLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { identifier, password } = req.body;
      const result = await userService.authenticateUser(identifier, password);
      
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }
);

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await userService.getUserById(req.userId);
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Profile not found'
      });
    }
  }
);

// @route   GET /api/users/:userId
// @desc    Get user by ID
// @access  Private (own profile only)
router.get('/:userId',
  validateUserId,
  handleValidationErrors,
  authenticateToken,
  checkResourceOwnership,
  async (req, res) => {
    try {
      const result = await userService.getUserById(req.params.userId);
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'User not found'
      });
    }
  }
);

// @route   PUT /api/users/:userId/profile
// @desc    Update user profile
// @access  Private (own profile only)
router.put('/:userId/profile',
  validateUserId,
  validateProfileUpdate,
  handleValidationErrors,
  authenticateToken,
  checkResourceOwnership,
  async (req, res) => {
    try {
      const result = await userService.updateUserProfile(req.params.userId, req.body);
      
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Profile update failed'
      });
    }
  }
);

// @route   POST /api/users/:userId/addresses
// @desc    Add address to user profile
// @access  Private (own profile only)
router.post('/:userId/addresses',
  validateUserId,
  validateAddAddress,
  handleValidationErrors,
  authenticateToken,
  checkResourceOwnership,
  async (req, res) => {
    try {
      const result = await userService.addUserAddress(req.params.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Add address error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add address'
      });
    }
  }
);

// @route   PUT /api/users/:userId/preferences
// @desc    Update user preferences
// @access  Private (own profile only)
router.put('/:userId/preferences',
  validateUserId,
  validatePreferences,
  handleValidationErrors,
  authenticateToken,
  checkResourceOwnership,
  async (req, res) => {
    try {
      const result = await userService.updateUserPreferences(req.params.userId, req.body);
      
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update preferences'
      });
    }
  }
);

// @route   PUT /api/users/:userId/password
// @desc    Change user password
// @access  Private (own profile only)
router.put('/:userId/password',
  validateUserId,
  validatePasswordChange,
  handleValidationErrors,
  authenticateToken,
  checkResourceOwnership,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(req.params.userId, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to change password'
      });
    }
  }
);

// @route   GET /api/users/stats
// @desc    Get user statistics (for admin/analytics)
// @access  Public (can be restricted later)
router.get('/stats',
  optionalAuth,
  async (req, res) => {
    try {
      const result = await userService.getUserStats();
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get statistics'
      });
    }
  }
);

export default router;

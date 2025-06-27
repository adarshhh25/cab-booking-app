import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

class UserService {
  // Create a new user
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmailOrPhone(userData.email || userData.phone);
      if (existingUser) {
        throw new Error('User already exists with this email or phone number');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user._id);

      // Return user without password
      const userResponse = user.toJSON();
      
      return {
        success: true,
        message: 'User created successfully',
        data: {
          user: userResponse,
          token
        }
      };
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`User already exists with this ${field}`);
      }
      throw error;
    }
  }

  // Authenticate user (login)
  async authenticateUser(identifier, password) {
    try {
      // Find user by email or phone and include password
      const user = await User.findByEmailOrPhone(identifier).select('+password');
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new Error('Account is temporarily locked due to too many failed login attempts');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user._id);

      // Return user without password
      const userResponse = user.toJSON();
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      return {
        success: true,
        data: { user: user.toJSON() }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const { password, email, phone, isActive, isVerified, ...allowedUpdates } = updateData;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: allowedUpdates },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.toJSON() }
      };
    } catch (error) {
      throw error;
    }
  }

  // Add address to user
  async addUserAddress(userId, addressData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // If this is set as default, unset other default addresses
      if (addressData.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      }

      user.addresses.push(addressData);
      await user.save();

      return {
        success: true,
        message: 'Address added successfully',
        data: { user: user.toJSON() }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Preferences updated successfully',
        data: { user: user.toJSON() }
      };
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
            verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
            avgRating: { $avg: '$rating.average' }
          }
        }
      ]);

      return {
        success: true,
        data: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          avgRating: 0
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();

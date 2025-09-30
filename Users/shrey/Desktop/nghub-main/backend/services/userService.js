const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
  // Get all users
  static async getAllUsers() {
    try {
      const users = await User.findAll();
      return { users };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return { user };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Create user
  static async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const user = await User.create(userData);
      return { user };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id, userData) {
    try {
      const user = await User.update(id, userData);
      if (!user) {
        throw new Error('User not found');
      }
      return { user };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      const user = await User.delete(id);
      if (!user) {
        throw new Error('User not found');
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get users by role
  static async getUsersByRole(role) {
    try {
      const users = await User.findByRole(role);
      return { users };
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  // Get employees
  static async getEmployees() {
    try {
      const users = await User.findByRole('employee');
      return { users };
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  }

  // Login user
  static async loginUser(email, password) {
    try {
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      return { 
        user: userWithoutPassword, 
        token 
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }
}

module.exports = UserService;

const UserService = require('../services/userService');

class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const result = await UserService.getAllUsers();
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting all users:', error.message);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const requestingUser = req.user;
      
      // Security check: employees can only view their own profile
      if (requestingUser.role === 'employee' && requestingUser.id.toString() !== id.toString()) {
        return res.status(403).json({ error: 'You can only view your own profile' });
      }
      
      const result = await UserService.getUserById(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting user by ID:', error.message);
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch user' });
      }
    }
  }

  // Create user
  static async createUser(req, res) {
    try {
      const userData = req.body;
      const result = await UserService.createUser(userData);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating user:', error.message);
      if (error.message === 'User with this email already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const result = await UserService.updateUser(id, userData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating user:', error.message);
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update user' });
      }
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting user:', error.message);
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete user' });
      }
    }
  }

  // Get employees
  static async getEmployees(req, res) {
    try {
      const result = await UserService.getEmployees();
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting employees:', error.message);
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  }

  // Login user
  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await UserService.loginUser(email, password);
      res.json(result);
    } catch (error) {
      console.error('❌ Error logging in user:', error.message);
      res.status(401).json({ error: error.message });
    }
  }

  // Validate token
  static async validateToken(req, res) {
    try {
      // If we reach here, the token is valid (middleware verified it)
      // req.user is set by the auth middleware
      res.json({ 
        valid: true, 
        user: req.user 
      });
    } catch (error) {
      console.error('❌ Error validating token:', error.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Logout user
  static async logoutUser(req, res) {
    try {
      // In a more sophisticated setup, you might want to:
      // 1. Add the token to a blacklist
      // 2. Update user's token version in database
      // 3. Clear any server-side sessions
      
      // For now, we'll just send a success response
      // The client will clear the token from localStorage
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('❌ Error logging out user:', error.message);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}

module.exports = UserController;

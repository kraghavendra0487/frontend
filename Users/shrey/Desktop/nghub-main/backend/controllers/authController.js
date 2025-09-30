const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

class AuthController {
  // 🔑 LOGIN - Validate credentials and return JWT
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and password are required' 
        });
      }

      // Find user by email
      const userQuery = 'SELECT id, employee_id, name, email, contact, role, password FROM users WHERE email = $1';
      const userResult = await pool.query(userQuery, [email]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
      }

      const user = userResult.rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
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

      res.json({
        success: true,
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  // 🔓 LOGOUT - Clear token (client-side mainly)
  static async logout(req, res) {
    try {
      // In a production app, you might:
      // 1. Add token to blacklist
      // 2. Update user's token_version in DB
      // 3. Clear server-side sessions

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Logout failed' 
      });
    }
  }

  // 🔍 VALIDATE TOKEN - Check if token is still valid
  static async validateToken(req, res) {
    try {
      // If we reach here, the token is valid (middleware verified it)
      // req.user is set by the auth middleware
      res.json({
        success: true,
        valid: true,
        user: req.user
      });
    } catch (error) {
      console.error('❌ Token validation error:', error);
      res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
  }

  // 👤 GET PROFILE - Get current user info
  static async getProfile(req, res) {
    try {
      // req.user is set by auth middleware
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get profile' 
      });
    }
  }
}

module.exports = AuthController;

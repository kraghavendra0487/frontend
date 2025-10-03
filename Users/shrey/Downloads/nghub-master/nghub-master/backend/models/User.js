const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Get user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT id, employee_id, name, email, contact, role, password FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const query = 'SELECT id, employee_id, name, email, contact, role FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { employee_id, name, email, contact, password, role } = userData;
      
      // Hash password before storing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (employee_id, name, email, contact, password, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING id, employee_id, name, email, contact, role, created_at
      `;
      const values = [employee_id, name, email, contact, hashedPassword, role];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const { name, email, contact, role } = userData;
      const query = `
        UPDATE users 
        SET name = $1, email = $2, contact = $3, role = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id, employee_id, name, email, contact, role
      `;
      const values = [name, email, contact, role, id];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get all users
  static async findAll() {
    try {
      const query = 'SELECT id, employee_id, name, email, contact, role, created_at FROM users ORDER BY created_at DESC';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  // Get users by role
  static async findByRole(role) {
    try {
      const query = 'SELECT id, employee_id, name, email, contact, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [role]);
      return result.rows;
    } catch (error) {
      console.error('Error finding users by role:', error);
      throw error;
    }
  }
}

module.exports = User;

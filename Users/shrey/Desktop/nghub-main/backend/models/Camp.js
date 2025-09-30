const pool = require('../config/database');

class Camp {
  // Get all camps
  static async findAll() {
    try {
      const query = `
        SELECT c.*, u1.name as conducted_by_name, u1.email as conducted_by_email, u2.name as created_by_name, u2.email as created_by_email
        FROM camps c
        LEFT JOIN users u1 ON c.conducted_by = u1.employee_id
        LEFT JOIN users u2 ON c.created_by = u2.id
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error finding all camps:', error);
      throw error;
    }
  }

  // Get camp by ID
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, u1.name as conducted_by_name, u1.email as conducted_by_email, u2.name as created_by_name, u2.email as created_by_email
        FROM camps c
        LEFT JOIN users u1 ON c.conducted_by = u1.employee_id
        LEFT JOIN users u2 ON c.created_by = u2.id
        WHERE c.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding camp by ID:', error);
      throw error;
    }
  }

  // Get camps by employee ID
  static async findByEmployeeId(employeeId) {
    try {
      // First get the user's employee_id
      const userQuery = 'SELECT employee_id FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [employeeId]);
      
      if (!userResult.rows.length) {
        return [];
      }
      
      const employee_id = userResult.rows[0].employee_id;
      
      const query = `
        SELECT c.*, u1.name as conducted_by_name, u1.email as conducted_by_email, u2.name as created_by_name, u2.email as created_by_email
        FROM camps c
        LEFT JOIN users u1 ON c.conducted_by = u1.employee_id
        LEFT JOIN users u2 ON c.created_by = u2.id
        WHERE c.conducted_by = $1 
           OR c.created_by = $2
           OR $2::text = ANY(c.assigned_to)
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query, [employee_id, employeeId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding camps by employee ID:', error);
      throw error;
    }
  }

  // Create new camp
  static async create(campData) {
    try {
      const { camp_date, location, location_link, phone_number, status, conducted_by, assigned_to, created_by } = campData;
      const query = `
        INSERT INTO camps (camp_date, location, location_link, phone_number, status, conducted_by, assigned_to, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [camp_date, location, location_link, phone_number, status, conducted_by, assigned_to, created_by];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating camp:', error);
      throw error;
    }
  }

  // Update camp
  static async update(id, campData) {
    try {
      const { camp_date, location, location_link, phone_number, status, conducted_by, assigned_to } = campData;
      const query = `
        UPDATE camps 
        SET camp_date = $1, location = $2, location_link = $3, phone_number = $4, 
            status = $5, conducted_by = $6, assigned_to = $7, last_updated = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;
      const values = [camp_date, location, location_link, phone_number, status, conducted_by, assigned_to, id];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating camp:', error);
      throw error;
    }
  }

  // Delete camp
  static async delete(id) {
    try {
      const query = 'DELETE FROM camps WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting camp:', error);
      throw error;
    }
  }

  // Get camps by status
  static async findByStatus(status) {
    try {
      const query = `
        SELECT c.*, u1.name as conducted_by_name, u1.email as conducted_by_email, u2.name as created_by_name, u2.email as created_by_email
        FROM camps c
        LEFT JOIN users u1 ON c.conducted_by = u1.employee_id
        LEFT JOIN users u2 ON c.created_by = u2.id
        WHERE c.status = $1
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query, [status]);
      return result.rows;
    } catch (error) {
      console.error('Error finding camps by status:', error);
      throw error;
    }
  }

  // Search camps
  static async search(searchTerm) {
    try {
      const query = `
        SELECT c.*, u1.name as conducted_by_name, u1.email as conducted_by_email, u2.name as created_by_name, u2.email as created_by_email
        FROM camps c
        LEFT JOIN users u1 ON c.conducted_by = u1.employee_id
        LEFT JOIN users u2 ON c.created_by = u2.id
        WHERE c.location ILIKE $1 OR c.phone_number ILIKE $1
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error searching camps:', error);
      throw error;
    }
  }
}

module.exports = Camp;

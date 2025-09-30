const pool = require('../config/database');

class Claim {
  // Get all claims
  static async findAll() {
    try {
      const query = `
        SELECT cl.*, c.card_number, cu.customer_name, cu.phone_number as customer_phone
        FROM claims cl
        LEFT JOIN cards c ON cl.card_id = c.id
        LEFT JOIN customers cu ON c.customer_id = cu.id
        ORDER BY cl.created_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error finding all claims:', error);
      throw error;
    }
  }

  // Get claim by ID
  static async findById(id) {
    try {
      const query = `
        SELECT cl.*, c.card_number, cu.customer_name, cu.phone_number as customer_phone
        FROM claims cl
        LEFT JOIN cards c ON cl.card_id = c.id
        LEFT JOIN customers cu ON c.customer_id = cu.id
        WHERE cl.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding claim by ID:', error);
      throw error;
    }
  }

  // Get claims by card ID
  static async findByCardId(cardId) {
    try {
      const query = `
        SELECT cl.*, c.card_number, cu.customer_name, cu.phone_number as customer_phone
        FROM claims cl
        LEFT JOIN cards c ON cl.card_id = c.id
        LEFT JOIN customers cu ON c.customer_id = cu.id
        WHERE cl.card_id = $1
        ORDER BY cl.created_at DESC
      `;
      const result = await pool.query(query, [cardId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding claims by card ID:', error);
      throw error;
    }
  }

  // Get claims by customer ID
  static async findByCustomerId(customerId) {
    try {
      const query = `
        SELECT cl.*, c.card_number, cu.customer_name, cu.phone_number as customer_phone
        FROM claims cl
        LEFT JOIN cards c ON cl.card_id = c.id
        LEFT JOIN customers cu ON c.customer_id = cu.id
        WHERE cu.id = $1
        ORDER BY cl.created_at DESC
      `;
      const result = await pool.query(query, [customerId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding claims by customer ID:', error);
      throw error;
    }
  }

  // Get claims by employee ID
  static async findByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT cl.*, c.card_number, cu.customer_name, cu.phone_number as customer_phone
        FROM claims cl
        LEFT JOIN cards c ON cl.card_id = c.id
        LEFT JOIN customers cu ON c.customer_id = cu.id
        WHERE cu.created_by = $1
        ORDER BY cl.created_at DESC
      `;
      const result = await pool.query(query, [employeeId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding claims by employee ID:', error);
      throw error;
    }
  }

  // Create new claim
  static async create(claimData) {
    try {
      const { card_id, discussed_amount, paid_amount, pending_amount, type_of_claim, process_state, created_by } = claimData;
      const query = `
        INSERT INTO claims (card_id, discussed_amount, paid_amount, pending_amount, type_of_claim, process_state, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [card_id, discussed_amount, paid_amount, pending_amount, type_of_claim, process_state, created_by];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  }

  // Update claim
  static async update(id, claimData) {
    try {
      const { discussed_amount, paid_amount, pending_amount, type_of_claim, process_state } = claimData;
      const query = `
        UPDATE claims 
        SET discussed_amount = $1, paid_amount = $2, pending_amount = $3, type_of_claim = $4, process_state = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      const values = [discussed_amount, paid_amount, pending_amount, type_of_claim, process_state, id];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating claim:', error);
      throw error;
    }
  }

  // Delete claim
  static async delete(id) {
    try {
      const query = 'DELETE FROM claims WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting claim:', error);
      throw error;
    }
  }

  // Get claims by status
  static async findByStatus(status) {
    try {
      const query = `
        SELECT cl.*, c.card_number, cu.customer_name, cu.phone_number as customer_phone
        FROM claims cl
        LEFT JOIN cards c ON cl.card_id = c.id
        LEFT JOIN customers cu ON c.customer_id = cu.id
        WHERE cl.process_state = $1
        ORDER BY cl.created_at DESC
      `;
      const result = await pool.query(query, [status]);
      return result.rows;
    } catch (error) {
      console.error('Error finding claims by status:', error);
      throw error;
    }
  }
}

module.exports = Claim;

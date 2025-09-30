const pool = require('../config/database');

class Customer {
  // Get all customers
  static async findAll() {
    try {
      const query = `
        SELECT c.*, u.name as employee_name, u.email as employee_email
        FROM customers c
        LEFT JOIN users u ON c.created_by = u.id
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error finding all customers:', error);
      throw error;
    }
  }

  // Get customer by ID
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, u.name as employee_name, u.email as employee_email
        FROM customers c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding customer by ID:', error);
      throw error;
    }
  }

  // Get customers by employee ID
  static async findByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT c.*, u.name as employee_name, u.email as employee_email
        FROM customers c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.created_by = $1
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query, [employeeId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding customers by employee ID:', error);
      throw error;
    }
  }

  // Create new customer
  static async create(customerData) {
    try {
      const { customer_name, phone_number, type_of_work, discussed_amount, paid_amount, pending_amount, mode_of_payment, created_by } = customerData;
      const query = `
        INSERT INTO customers (customer_name, phone_number, type_of_work, discussed_amount, paid_amount, pending_amount, mode_of_payment, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [customer_name, phone_number, type_of_work, discussed_amount, paid_amount, pending_amount, mode_of_payment, created_by];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Update customer
  static async update(id, customerData) {
    try {
      const { customer_name, phone_number, type_of_work, discussed_amount, paid_amount, pending_amount, mode_of_payment } = customerData;
      const query = `
        UPDATE customers 
        SET customer_name = $1, phone_number = $2, type_of_work = $3, discussed_amount = $4, paid_amount = $5, pending_amount = $6, mode_of_payment = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;
      const values = [customer_name, phone_number, type_of_work, discussed_amount, paid_amount, pending_amount, mode_of_payment, id];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete customer
  static async delete(id) {
    try {
      const query = 'DELETE FROM customers WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Search customers
  static async search(searchTerm) {
    try {
      const query = `
        SELECT c.*, u.name as employee_name, u.email as employee_email
        FROM customers c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.customer_name ILIKE $1 OR c.phone_number ILIKE $1 OR c.type_of_work ILIKE $1
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
}

module.exports = Customer;

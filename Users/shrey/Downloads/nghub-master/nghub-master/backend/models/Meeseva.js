const pool = require('../config/database');

class Meeseva {
  // Get all meeseva records
  static async findAll() {
    const query = `
      SELECT * FROM meeseva
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Get meeseva record by ID
  static async findById(id) {
    const query = 'SELECT * FROM meeseva WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  // Create new meeseva record
  static async create({ name, advance_amount, used_amount, comment, created_by }) {
    const query = `
      INSERT INTO meeseva (name, advance_amount, used_amount, comment, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [name, advance_amount, used_amount, comment, created_by]);
    return rows[0];
  }

  // Update meeseva record
  static async update(id, { name, advance_amount, used_amount, comment, updated_by }) {
    const query = `
      UPDATE meeseva
      SET name = $1, advance_amount = $2, used_amount = $3, comment = $4, updated_by = $5
      WHERE id = $6
      RETURNING *
    `;
    const { rows } = await pool.query(query, [name, advance_amount, used_amount, comment, updated_by, id]);
    return rows[0];
  }

  // Delete meeseva record
  static async delete(id) {
    const query = 'DELETE FROM meeseva WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Meeseva;

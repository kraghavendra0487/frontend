const pool = require('../config/database');

class FinancialTransaction {
  // Get all financial transactions with pagination and filtering
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        bank = '',
        type = '',
        startDate = '',
        endDate = '',
        minAmount = '',
        maxAmount = ''
      } = options;

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      // Build WHERE conditions
      if (search) {
        paramCount++;
        whereConditions.push(`description ILIKE $${paramCount}`);
        queryParams.push(`%${search}%`);
      }

      if (bank) {
        paramCount++;
        whereConditions.push(`bank = $${paramCount}`);
        queryParams.push(bank);
      }

      if (type) {
        paramCount++;
        whereConditions.push(`type = $${paramCount}`);
        queryParams.push(type);
      }

      if (startDate) {
        paramCount++;
        whereConditions.push(`transaction_date >= $${paramCount}`);
        queryParams.push(startDate);
      }

      if (endDate) {
        paramCount++;
        whereConditions.push(`transaction_date <= $${paramCount}`);
        queryParams.push(endDate);
      }

      if (minAmount) {
        paramCount++;
        whereConditions.push(`amount >= $${paramCount}`);
        queryParams.push(parseFloat(minAmount));
      }

      if (maxAmount) {
        paramCount++;
        whereConditions.push(`amount <= $${paramCount}`);
        queryParams.push(parseFloat(maxAmount));
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM financial_transactions ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated results
      paramCount++;
      const dataQuery = `
        SELECT * FROM financial_transactions 
        ${whereClause}
        ORDER BY transaction_date DESC, created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      queryParams.push(limit, offset);

      const dataResult = await pool.query(dataQuery, queryParams);

      return {
        transactions: dataResult.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      };
    } catch (error) {
      console.error('Error finding financial transactions:', error);
      throw error;
    }
  }

  // Get single financial transaction by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM financial_transactions WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding financial transaction by ID:', error);
      throw error;
    }
  }

  // Create new financial transaction
  static async create(transactionData) {
    try {
      const {
        description,
        bank,
        amount,
        type,
        transaction_date
      } = transactionData;

      const query = `
        INSERT INTO financial_transactions (
          description, bank, amount, type, transaction_date
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [description, bank, amount, type, transaction_date];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating financial transaction:', error);
      throw error;
    }
  }

  // Update financial transaction
  static async update(id, transactionData) {
    try {
      const {
        description,
        bank,
        amount,
        type,
        transaction_date
      } = transactionData;

      const query = `
        UPDATE financial_transactions
        SET description = $1, bank = $2, amount = $3, type = $4, transaction_date = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `;

      const values = [description, bank, amount, type, transaction_date, id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Financial transaction not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating financial transaction:', error);
      throw error;
    }
  }

  // Delete financial transaction
  static async delete(id) {
    try {
      const query = 'DELETE FROM financial_transactions WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Financial transaction not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting financial transaction:', error);
      throw error;
    }
  }

  // Bulk create financial transactions
  static async bulkCreate(transactions) {
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        const values = transactions.map(transaction => [
          transaction.description,
          transaction.bank,
          transaction.amount,
          transaction.type,
          transaction.transaction_date
        ]);

        const query = `
          INSERT INTO financial_transactions (description, bank, amount, type, transaction_date)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;

        const result = await client.query(query, values);
        await client.query('COMMIT');
        return result.rows;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error bulk creating financial transactions:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error bulk creating financial transactions:', error);
      throw error;
    }
  }

  // Get distinct values for filter dropdowns
  static async getDistinctValues(column) {
    try {
      const validColumns = ['bank', 'type'];
      if (!validColumns.includes(column)) {
        throw new Error('Invalid column name');
      }

      const query = `SELECT DISTINCT ${column} FROM financial_transactions WHERE ${column} IS NOT NULL ORDER BY ${column}`;
      const result = await pool.query(query);
      return result.rows.map(row => row[column]);
    } catch (error) {
      console.error('Error getting distinct values:', error);
      throw error;
    }
  }

  // Get all transactions for export
  static async findAllForExport(options = {}) {
    try {
      const {
        search = '',
        bank = '',
        type = '',
        startDate = '',
        endDate = '',
        minAmount = '',
        maxAmount = ''
      } = options;

      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      // Build WHERE conditions (same logic as findAll)
      if (search) {
        paramCount++;
        whereConditions.push(`description ILIKE $${paramCount}`);
        queryParams.push(`%${search}%`);
      }

      if (bank) {
        paramCount++;
        whereConditions.push(`bank = $${paramCount}`);
        queryParams.push(bank);
      }

      if (type) {
        paramCount++;
        whereConditions.push(`type = $${paramCount}`);
        queryParams.push(type);
      }

      if (startDate) {
        paramCount++;
        whereConditions.push(`transaction_date >= $${paramCount}`);
        queryParams.push(startDate);
      }

      if (endDate) {
        paramCount++;
        whereConditions.push(`transaction_date <= $${paramCount}`);
        queryParams.push(endDate);
      }

      if (minAmount) {
        paramCount++;
        whereConditions.push(`amount >= $${paramCount}`);
        queryParams.push(parseFloat(minAmount));
      }

      if (maxAmount) {
        paramCount++;
        whereConditions.push(`amount <= $${paramCount}`);
        queryParams.push(parseFloat(maxAmount));
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT * FROM financial_transactions 
        ${whereClause}
        ORDER BY transaction_date DESC, created_at DESC
      `;

      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error finding financial transactions for export:', error);
      throw error;
    }
  }
}

module.exports = FinancialTransaction;

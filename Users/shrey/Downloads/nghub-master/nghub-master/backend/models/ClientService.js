const pool = require('../config/database');

// ⚠️ IMPORTANT: You need to run these SQL commands in your database first!

/*
-- FINAL client_services table structure:
CREATE TABLE public.client_services (
    id BIGSERIAL NOT NULL,
    created_at TIMESTAMPTZ NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NULL DEFAULT now(),
    establishment_name VARCHAR(255) NULL,
    employer_name VARCHAR(255) NULL,
    email_id VARCHAR(255) NULL,
    mobile_number VARCHAR(20) NULL,
    CONSTRAINT client_services_pkey PRIMARY KEY (id),
    CONSTRAINT client_services_unique_establishment UNIQUE (establishment_name, mobile_number)
) TABLESPACE pg_default;

-- Create the client_service_items table for individual services
CREATE TABLE client_service_items (
    id BIGSERIAL PRIMARY KEY,
    client_service_id BIGINT NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    service_status VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for client_services table
CREATE OR REPLACE FUNCTION update_client_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_services_timestamp
BEFORE UPDATE ON client_services
FOR EACH ROW EXECUTE FUNCTION update_client_services_timestamp();

-- Trigger for client_service_items table
CREATE OR REPLACE FUNCTION update_client_service_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_service_items_timestamp
BEFORE UPDATE ON client_service_items
FOR EACH ROW EXECUTE FUNCTION update_client_service_items_timestamp();
*/

class ClientServiceItem {
  // Get all service items for a client
  static async findByClientServiceId(clientServiceId) {
    try {
      const query = 'SELECT * FROM client_service_items WHERE client_service_id = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [clientServiceId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding service items by client service ID:', error);
      throw error;
    }
  }

  // Create new service item
  static async create(serviceItemData) {
    try {
      const { client_service_id, service_name, service_status, remarks } = serviceItemData;

      const query = `
        INSERT INTO client_service_items (client_service_id, service_name, service_status, remarks)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [client_service_id, service_name, service_status, remarks];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating service item:', error);
      throw error;
    }
  }

  // Update service item
  static async update(id, serviceItemData) {
    try {
      const { service_name, service_status, remarks } = serviceItemData;

      const query = `
        UPDATE client_service_items
        SET service_name = $1, service_status = $2, remarks = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;

      const values = [service_name, service_status, remarks, id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Service item not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating service item:', error);
      throw error;
    }
  }

  // Delete service item
  static async delete(id) {
    try {
      const query = 'DELETE FROM client_service_items WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Service item not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting service item:', error);
      throw error;
    }
  }

  // Get service item by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM client_service_items WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding service item by ID:', error);
      throw error;
    }
  }
}

class ClientService {
  // Get all client services with pagination and filtering
  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', search = '' } = options;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Search across available fields
      if (search) {
        whereConditions.push(`(
          establishment_name ILIKE $${paramIndex} OR
          employer_name ILIKE $${paramIndex} OR
          email_id ILIKE $${paramIndex} OR
          mobile_number ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM client_services ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
      const totalCount = parseInt(countResult.rows[0].total);

      // Get paginated results
      const orderByClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      const paginationQuery = `
        SELECT * FROM client_services
        ${whereClause}
        ${orderByClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const result = await pool.query(paginationQuery, queryParams);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: result.rows,
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('Error finding all client services:', error);
      throw error;
    }
  }

  // Get client service by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM client_services WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding client service by ID:', error);
      throw error;
    }
  }

  // Create new client service (simplified structure)
  static async create(clientServiceData) {
    try {
      const {
        establishment_name, employer_name, email_id, mobile_number
      } = clientServiceData;

      const query = `
        INSERT INTO client_services (
          establishment_name, employer_name, email_id, mobile_number
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [establishment_name, employer_name, email_id, mobile_number];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating client service:', error);
      throw error;
    }
  }

  // Bulk create client services (for Excel import)
  static async bulkCreate(clientServicesData) {
    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < clientServicesData.length; i++) {
        try {
          const result = await this.create(clientServicesData[i]);
          results.push(result);
        } catch (error) {
          errors.push({
            row: i + 1,
            data: clientServicesData[i],
            error: error.message
          });
        }
      }

      return { results, errors };
    } catch (error) {
      console.error('Error in bulk create:', error);
      throw error;
    }
  }

  // Update client service (simplified structure)
  static async update(id, clientServiceData) {
    try {
      const {
        establishment_name, employer_name, email_id, mobile_number
      } = clientServiceData;

      const query = `
        UPDATE client_services
        SET establishment_name = $1, employer_name = $2, email_id = $3,
            mobile_number = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;

      const values = [establishment_name, employer_name, email_id, mobile_number, id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Client service not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating client service:', error);
      throw error;
    }
  }

  // Delete client service
  static async delete(id) {
    try {
      const query = 'DELETE FROM client_services WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting client service:', error);
      throw error;
    }
  }

  // Get distinct values for filter dropdowns (available client fields)
  static async getDistinctValues(column) {
    try {
      const validColumns = [
        'establishment_name', 'employer_name', 'email_id', 'mobile_number'
      ];
      if (!validColumns.includes(column)) {
        throw new Error('Invalid column for distinct values');
      }

      const query = `SELECT DISTINCT ${column} FROM client_services WHERE ${column} IS NOT NULL ORDER BY ${column}`;
      const result = await pool.query(query);
      return result.rows.map(row => row[column]).filter(Boolean);
    } catch (error) {
      console.error('Error getting distinct values:', error);
      throw error;
    }
  }

  // Export all data as CSV format
  static async exportAll() {
    try {
      const query = 'SELECT * FROM client_services ORDER BY created_at DESC';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error exporting client services:', error);
      throw error;
    }
  }

  // Get client service with all service items
  static async findByIdWithServices(id) {
    try {
      // Get basic client info
      const clientQuery = 'SELECT * FROM client_services WHERE id = $1';
      const clientResult = await pool.query(clientQuery, [id]);

      if (clientResult.rows.length === 0) {
        return null;
      }

      const clientService = clientResult.rows[0];

      // Get associated service items
      const serviceItems = await ClientServiceItem.findByClientServiceId(id);

      return {
        ...clientService,
        service_items: serviceItems
      };
    } catch (error) {
      console.error('Error finding client service with services:', error);
      throw error;
    }
  }

  // Get all client services with their service items count
  static async findAllWithServiceCounts(options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', search = '', startDate, endDate } = options;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Search across contact fields only
      if (search) {
        whereConditions.push(`(
          cs.contact_person ILIKE $${paramIndex} OR
          cs.contact_number ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Date range filter
      if (startDate) {
        whereConditions.push(`cs.date >= $${paramIndex}`);
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereConditions.push(`cs.date <= $${paramIndex}`);
        queryParams.push(endDate);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM client_services cs ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
      const totalCount = parseInt(countResult.rows[0].total);

      // Get paginated results with service counts
      const orderByClause = `ORDER BY cs.${sortBy} ${sortOrder.toUpperCase()}`;
      const paginationQuery = `
        SELECT
          cs.*,
          COALESCE(service_counts.service_count, 0) as service_count
        FROM client_services cs
        LEFT JOIN (
          SELECT client_service_id, COUNT(*) as service_count
          FROM client_service_items
          GROUP BY client_service_id
        ) service_counts ON cs.id = service_counts.client_service_id
        ${whereClause}
        ${orderByClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const result = await pool.query(paginationQuery, queryParams);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: result.rows,
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('Error finding all client services with service counts:', error);
      throw error;
    }
  }
}

// Export both classes
module.exports = { ClientService, ClientServiceItem };

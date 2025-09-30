const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

require('dotenv').config();

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');

    // Create test admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await pool.query(`
      INSERT INTO users (employee_id, name, email, contact, password, role) 
      VALUES ('ADMIN001', 'Admin User', 'admin@example.com', '9876543210', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role
    `, [adminPassword]);

    if (adminResult.rows[0]) {
      console.log('✅ Admin user created:', adminResult.rows[0]);
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create test employee user
    const empPassword = await bcrypt.hash('employee123', 10);
    const empResult = await pool.query(`
      INSERT INTO users (employee_id, name, email, contact, password, role) 
      VALUES ('EMP001', 'John Doe', 'john@example.com', '9876543211', $1, 'employee')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role
    `, [empPassword]);

    if (empResult.rows[0]) {
      console.log('✅ Employee user created:', empResult.rows[0]);
    } else {
      console.log('ℹ️ Employee user already exists');
    }

    console.log('');
    console.log('🔑 Test credentials:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  Employee: john@example.com / employee123');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();

const { Pool } = require('pg');

require('dotenv').config();

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabase() {
  try {
    console.log('🔄 Checking database schema...');

    // Check users table structure
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    console.log('📊 Users table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    // Check if token_version column exists
    const hasTokenVersion = result.rows.some(row => row.column_name === 'token_version');
    console.log(`\n🔍 token_version column exists: ${hasTokenVersion}`);

    // Check existing users
    const users = await pool.query('SELECT id, email, role FROM users LIMIT 5');
    console.log('\n👥 Existing users:');
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();

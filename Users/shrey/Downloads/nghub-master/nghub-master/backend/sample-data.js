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

async function createSampleData() {
  try {
    console.log('🔄 Creating sample data...');

    // Create sample admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await pool.query(`
      INSERT INTO users (employee_id, name, email, contact, password, role) 
      VALUES ('ADMIN001', 'Admin User', 'admin@example.com', '9876543210', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [adminPassword]);

    let adminId = adminResult.rows[0]?.id;
    if (!adminId) {
      const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
      adminId = existingAdmin.rows[0].id;
    }

    // Create sample employees
    const employees = [
      { employee_id: 'EMP001', name: 'John Doe', email: 'john@example.com', contact: '9876543211', role: 'employee' },
      { employee_id: 'EMP002', name: 'Jane Smith', email: 'jane@example.com', contact: '9876543212', role: 'employee' },
      { employee_id: 'EMP003', name: 'Mike Johnson', email: 'mike@example.com', contact: '9876543213', role: 'employee' }
    ];

    const employeeIds = [];
    for (const emp of employees) {
      const empPassword = await bcrypt.hash('employee123', 10);
      const empResult = await pool.query(`
        INSERT INTO users (employee_id, name, email, contact, password, role) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [emp.employee_id, emp.name, emp.email, emp.contact, empPassword, emp.role]);
      
      if (empResult.rows[0]) {
        employeeIds.push(empResult.rows[0].id);
      } else {
        const existingEmp = await pool.query('SELECT id FROM users WHERE email = $1', [emp.email]);
        employeeIds.push(existingEmp.rows[0].id);
      }
    }

    // Create sample customers
    const customers = [
      {
        customer_name: 'Alice Brown',
        phone_number: '9876543221',
        email: 'alice@example.com',
        type_of_work: 'Interior',
        discussed_amount: '50000',
        pending_amount: '10000',
        paid_amount: '40000',
        credit_amount: '0',
        created_by: employeeIds[0]
      },
      {
        customer_name: 'Bob Wilson',
        phone_number: '9876543222',
        email: 'bob@example.com',
        type_of_work: 'Exterior',
        discussed_amount: '75000',
        pending_amount: '25000',
        paid_amount: '50000',
        credit_amount: '0',
        created_by: employeeIds[1]
      },
      {
        customer_name: 'Carol Davis',
        phone_number: '9876543223',
        email: 'carol@example.com',
        type_of_work: 'Both',
        discussed_amount: '100000',
        pending_amount: '30000',
        paid_amount: '70000',
        credit_amount: '0',
        created_by: employeeIds[2]
      },
      {
        customer_name: 'David Miller',
        phone_number: '9876543224',
        email: 'david@example.com',
        type_of_work: 'Interior',
        discussed_amount: '30000',
        pending_amount: '0',
        paid_amount: '30000',
        credit_amount: '0',
        created_by: employeeIds[0]
      }
    ];

    for (const customer of customers) {
      await pool.query(`
        INSERT INTO customers (customer_name, phone_number, email, type_of_work, discussed_amount, pending_amount, paid_amount, credit_amount, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT DO NOTHING
      `, [
        customer.customer_name,
        customer.phone_number,
        customer.email,
        customer.type_of_work,
        customer.discussed_amount,
        customer.pending_amount,
        customer.paid_amount,
        customer.credit_amount,
        customer.created_by
      ]);
    }

    // Create sample camps
    const camps = [
      {
        camp_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        location: 'Mumbai Central',
        location_link: 'https://maps.google.com/mumbai-central',
        phone_number: '9876543231',
        status: 'planned',
        conducted_by: 'John Doe',
        assigned_to: [employeeIds[0].toString(), employeeIds[1].toString()],
        created_by: adminId
      },
      {
        camp_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        location: 'Delhi NCR',
        location_link: 'https://maps.google.com/delhi-ncr',
        phone_number: '9876543232',
        status: 'ongoing',
        conducted_by: 'Jane Smith',
        assigned_to: [employeeIds[1].toString(), employeeIds[2].toString()],
        created_by: adminId
      },
      {
        camp_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        location: 'Bangalore Tech Park',
        location_link: 'https://maps.google.com/bangalore-tech-park',
        phone_number: '9876543233',
        status: 'completed',
        conducted_by: 'Mike Johnson',
        assigned_to: [employeeIds[2].toString()],
        created_by: adminId
      }
    ];

    for (const camp of camps) {
      await pool.query(`
        INSERT INTO camps (camp_date, location, location_link, phone_number, status, conducted_by, assigned_to, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
      `, [
        camp.camp_date,
        camp.location,
        camp.location_link,
        camp.phone_number,
        camp.status,
        camp.conducted_by,
        camp.assigned_to,
        camp.created_by
      ]);
    }

    console.log('✅ Sample data created successfully!');
    console.log('📊 Created:');
    console.log('  - 1 Admin user (admin@example.com / admin123)');
    console.log('  - 3 Employee users (employee123)');
    console.log('  - 4 Sample customers');
    console.log('  - 3 Sample camps');
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  Employee: john@example.com / employee123');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await pool.end();
  }
}

createSampleData();

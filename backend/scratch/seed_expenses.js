
const { Client } = require('pg');
require('dotenv').config();

async function seed() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

  await client.connect();

  // Get a valid user ID
  const userRes = await client.query('SELECT id FROM "user" LIMIT 1');
  if (userRes.rows.length === 0) {
    console.error('No user found in the database.');
    await client.end();
    return;
  }
  const userId = userRes.rows[0].id;

  const categories = [
    { name: 'Rent', description: 'Monthly store/office rent' },
    { name: 'Electricity Bill', description: 'Utility - Electricity' },
    { name: 'Water Bill', description: 'Utility - Water' },
    { name: 'Internet / Phone', description: 'Communication expenses' },
    { name: 'Salary', description: 'Employee wages and salaries' },
    { name: 'Maintenance', description: 'Repair and maintenance' },
    { name: 'Supplies', description: 'Office or store supplies' },
    { name: 'Marketing', description: 'Advertising and promotion' },
    { name: 'Others', description: 'Miscellaneous expenses' }
  ];

  for (const cat of categories) {
    try {
      await client.query(
        'INSERT INTO expense_category (id, name, description, status, created_on, created_by_id) VALUES (gen_random_uuid(), $1, $2, true, now(), $3) ON CONFLICT (name) DO NOTHING',
        [cat.name, cat.description, userId]
      );
      console.log(`Inserted category: ${cat.name}`);
    } catch (err) {
      console.error(`Error inserting ${cat.name}:`, err.message);
    }
  }

  await client.end();
}

seed();

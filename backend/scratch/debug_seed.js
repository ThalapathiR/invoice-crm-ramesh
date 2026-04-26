
const { Client } = require('pg');
require('dotenv').config();

async function debug() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

  await client.connect();

  console.log('Connected to:', process.env.DB_NAME);

  const userRes = await client.query('SELECT id FROM "user" LIMIT 1');
  const userId = userRes.rows[0].id;

  await client.query('INSERT INTO expense_category (id, name, description, status, created_on, created_by_id) VALUES (gen_random_uuid(), $1, $2, true, now(), $3)', ['Test Category', 'Desc', userId]);
  
  const res = await client.query('SELECT * FROM expense_category');
  console.log('Rows after insert:', res.rows.length);
  console.log('Data:', JSON.stringify(res.rows));

  await client.end();
}

debug();

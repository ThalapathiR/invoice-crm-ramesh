const { Client } = require('pg');
require('dotenv').config();

async function checkDb() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
  });

  try {
    await client.connect();
    console.log('--- User Table ---');
    const users = await client.query('SELECT id, email, username FROM "user"');
    console.log(users.rows);

    console.log('\n--- Company Table ---');
    const companies = await client.query('SELECT id, name FROM company');
    console.log(companies.rows);

    console.log('\n--- User Role Table ---');
    const roles = await client.query('SELECT id, name FROM user_role');
    console.log(roles.rows);
  } catch (err) {
    console.error('DB Check failed:', err);
  } finally {
    await client.end();
  }
}

checkDb();

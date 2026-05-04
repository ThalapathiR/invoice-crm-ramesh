import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

async function checkSchema() {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: false,
    });

    const columns = await connection.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'product';
    `);

    console.log("Columns in 'product' table:");
    console.table(columns);

    await connection.close();
  } catch (err) {
    console.error("Error checking schema:", err);
  }
}

checkSchema();

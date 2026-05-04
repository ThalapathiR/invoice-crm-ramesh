import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

async function migrate() {
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

    console.log("Adding 'mrp' column to 'product' table...");
    await connection.query(`
      ALTER TABLE "product" 
      ADD COLUMN IF NOT EXISTS "mrp" numeric(10,2) DEFAULT 0;
    `);

    console.log("Migration successful!");
    await connection.close();
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();

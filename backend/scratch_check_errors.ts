import { DataSource } from 'typeorm';
import { error_log } from './src/Database/Table/Admin/error_log';
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkErrors() {
    const connection = await createConnection({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "billing_ramesh",
        entities: [error_log],
        synchronize: false,
    });

    const logs = await connection.getRepository(error_log).find({
        order: { created_on: 'DESC' },
        take: 5
    });

    console.log(JSON.stringify(logs, null, 2));
    await connection.close();
}

checkErrors().catch(console.error);

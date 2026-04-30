import { createConnection } from 'typeorm';
import { error_log } from './src/Database/Table/Admin/error_log';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function checkDiverseErrors() {
    try {
        const connection = await createConnection({
            type: "postgres",
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "5432"),
            username: process.env.DB_USER || "postgres",
            password: process.env.DB_PASS || "postgres",
            database: process.env.DB_NAME || "billing2",
            entities: [path.join(__dirname, 'src/Database/Table/**/*.{ts,js}')],
            synchronize: false,
        });

        console.log('Connected to database.');
        
        const logs = await connection.getRepository(error_log).find({
            where: [
                // Find errors that are not the common ones
                // Note: TypeORM where doesn't easily support NOT IN for many values in this syntax
            ],
            order: { created_on: 'DESC' },
            take: 20
        });

        console.log('Recent Error Logs:');
        logs.forEach(l => {
            if (l.message !== 'Invalid password' && l.message !== 'Unauthorized' && !l.message.includes('Cannot POST /api/v1/auth/logout')) {
                console.log(`[${l.created_on}] URL: ${l.url}, Message: ${l.message}`);
            }
        });

        await connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDiverseErrors();

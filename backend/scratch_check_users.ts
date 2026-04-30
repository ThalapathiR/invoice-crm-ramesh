import { createConnection } from 'typeorm';
import { user } from './src/Database/Table/Admin/user';
import { user_role } from './src/Database/Table/Admin/user_role';
import { company } from './src/Database/Table/Admin/company';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function checkUser() {
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
        
        const users = await connection.getRepository(user).find({
            relations: ['user_role']
        });

        console.log('Users in database:');
        users.forEach(u => {
            console.log(`Email: ${u.email}, Username: ${u.username}, Role: ${u.user_role?.name}, Password (encrypted): ${u.password}`);
        });

        await connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();

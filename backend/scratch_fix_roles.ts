import { DataSource } from 'typeorm';
import { user_role } from './src/Database/Table/Admin/user_role';
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkRoles() {
    const connection = await createConnection({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "billing_ramesh",
        entities: [user_role],
        synchronize: false,
    });

    const roles = await connection.getRepository(user_role).find();
    console.log(JSON.stringify(roles, null, 2));

    // Update is_team_role if missing
    for (const role of roles) {
        if (role.name === 'tenant' || role.name === 'user') {
            if (!role.is_team_role) {
                console.log(`Updating ${role.name} to is_team_role = true`);
                await connection.getRepository(user_role).update(role.id, { is_team_role: true });
            }
        }
    }

    await connection.close();
}

checkRoles().catch(console.error);

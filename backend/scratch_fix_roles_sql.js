const { Client } = require('pg');

async function fixRoles() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'Thala123@',
        database: 'testbilling',
    });

    try {
        await client.connect();
        console.log('Connected to database');
        
        const res = await client.query('UPDATE user_role SET is_team_role = true WHERE code IN (\'TENANT\', \'USER\', \'WORKSPACE_ADMIN\')');
        console.log(`Updated ${res.rowCount} roles`);
        
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fixRoles();

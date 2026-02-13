import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aadhaar_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function showAllData() {
    const client = await pool.connect();

    try {
        const result = await client.query(
            'SELECT * FROM aadhaar_details ORDER BY id ASC'
        );

        console.log('\n' + '='.repeat(80));
        console.log(`TOTAL RECORDS IN DATABASE: ${result.rows.length}`);
        console.log('='.repeat(80) + '\n');

        result.rows.forEach((row, index) => {
            console.log(`RECORD ${index + 1}:`);
            console.log(`  ID: ${row.id}`);
            console.log(`  Aadhaar Number: ${row.aadhaar_number}`);
            console.log(`  Name: ${row.name}`);
            console.log(`  Date of Birth: ${row.date_of_birth?.toISOString().split('T')[0] || 'N/A'}`);
            console.log(`  Gender: ${row.gender || 'N/A'}`);
            console.log(`  Address: ${row.address || 'N/A'}`);
            console.log(`  Phone: ${row.phone_number || 'N/A'}`);
            console.log(`  Email: ${row.email || 'N/A'}`);
            console.log(`  Created: ${row.created_at?.toISOString() || 'N/A'}`);
            console.log('');
        });

        console.log('='.repeat(80));

    } catch (error: any) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

showAllData();

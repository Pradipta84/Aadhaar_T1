import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aadhaar_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function verifyData() {
    const client = await pool.connect();

    try {
        console.log('📊 Verifying data in database...\n');

        // Get total count
        const countResult = await client.query('SELECT COUNT(*) FROM aadhaar_details');
        const totalRecords = parseInt(countResult.rows[0].count);

        console.log(`✅ Total records in database: ${totalRecords}\n`);

        // Get all records
        const result = await client.query(
            'SELECT aadhaar_number, name, date_of_birth, gender, address FROM aadhaar_details ORDER BY created_at DESC'
        );

        console.log('📋 All Aadhaar Records:\n');
        console.log('='.repeat(80));

        result.rows.forEach((row, index) => {
            console.log(`\n${index + 1}. ${row.name}`);
            console.log(`   Aadhaar Number: ${row.aadhaar_number}`);
            console.log(`   Date of Birth: ${row.date_of_birth?.toISOString().split('T')[0] || 'N/A'}`);
            console.log(`   Gender: ${row.gender}`);
            console.log(`   Address: ${row.address}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('\n✨ Database verification complete!');

    } catch (error: any) {
        console.error('❌ Error verifying data:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyData();

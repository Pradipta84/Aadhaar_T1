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

async function runTests() {
    const client = await pool.connect();

    try {
        console.log('\n========================================');
        console.log('TESTING AADHAAR DATABASE SEARCHES');
        console.log('========================================\n');

        // First, get all records to see what we have
        console.log('TEST 1: Get All Records');
        console.log('----------------------------------------');
        const allResults = await client.query('SELECT * FROM aadhaar_details ORDER BY created_at DESC');
        console.log(`Total records: ${allResults.rows.length}\n`);

        allResults.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   Aadhaar: ${row.aadhaar_number}`);
            console.log(`   Gender: ${row.gender}`);
            console.log(`   Address: ${row.address}`);
            console.log();
        });

        if (allResults.rows.length > 0) {
            const sampleRecord = allResults.rows[0];

            // Test 2: Search by exact Aadhaar number
            console.log('\n========================================');
            console.log('TEST 2: Search by Aadhaar Number');
            console.log('----------------------------------------');
            console.log(`Searching for: ${sampleRecord.aadhaar_number}\n`);

            const aadhaarResult = await client.query(
                'SELECT * FROM aadhaar_details WHERE aadhaar_number = $1',
                [sampleRecord.aadhaar_number]
            );

            if (aadhaarResult.rows.length > 0) {
                console.log('FOUND:');
                console.log(`Name: ${aadhaarResult.rows[0].name}`);
                console.log(`Aadhaar: ${aadhaarResult.rows[0].aadhaar_number}`);
                console.log(`Gender: ${aadhaarResult.rows[0].gender}`);
            } else {
                console.log('NOT FOUND');
            }

            // Test 3: Search by name (partial)
            console.log('\n========================================');
            console.log('TEST 3: Search by Name (Partial Match)');
            console.log('----------------------------------------');
            const searchName = sampleRecord.name.split(' ')[0]; // Get first name
            console.log(`Searching for names containing: "${searchName}"\n`);

            const nameResult = await client.query(
                'SELECT * FROM aadhaar_details WHERE LOWER(name) LIKE LOWER($1)',
                [`%${searchName}%`]
            );

            console.log(`Found ${nameResult.rows.length} matching record(s):`);
            nameResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.name} - ${row.aadhaar_number}`);
            });

            // Test 4: Search by gender
            console.log('\n========================================');
            console.log('TEST 4: Search by Gender');
            console.log('----------------------------------------');
            console.log(`Searching for gender: ${sampleRecord.gender}\n`);

            const genderResult = await client.query(
                'SELECT * FROM aadhaar_details WHERE LOWER(gender) = LOWER($1)',
                [sampleRecord.gender]
            );

            console.log(`Found ${genderResult.rows.length} record(s):`);
            genderResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.name} (${row.gender})`);
            });

            // Test 5: Search by address keyword
            console.log('\n========================================');
            console.log('TEST 5: Search by Address');
            console.log('----------------------------------------');
            const addressKeyword = sampleRecord.address?.split(',')[0] || 'Street';
            console.log(`Searching for addresses containing: "${addressKeyword}"\n`);

            const addressResult = await client.query(
                'SELECT * FROM aadhaar_details WHERE LOWER(address) LIKE LOWER($1)',
                [`%${addressKeyword}%`]
            );

            console.log(`Found ${addressResult.rows.length} record(s):`);
            addressResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.name}`);
                console.log(`   Address: ${row.address}`);
            });

            // Test 6: Pagination
            console.log('\n========================================');
            console.log('TEST 6: Pagination (Page 1, Size 3)');
            console.log('----------------------------------------');

            const paginationResult = await client.query(
                'SELECT * FROM aadhaar_details ORDER BY created_at DESC LIMIT $1 OFFSET $2',
                [3, 0]
            );

            console.log(`Showing ${paginationResult.rows.length} of ${allResults.rows.length} records:\n`);
            paginationResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.name} - ${row.aadhaar_number}`);
            });
        }

        console.log('\n========================================');
        console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('========================================\n');

    } catch (error: any) {
        console.error('ERROR:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

runTests();

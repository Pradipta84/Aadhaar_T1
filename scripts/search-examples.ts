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

/**
 * Example 1: Search by exact Aadhaar number
 */
async function searchByAadhaarNumber(aadhaarNumber: string) {
    const client = await pool.connect();
    try {
        console.log(`\n🔍 Searching by Aadhaar Number: ${aadhaarNumber}`);
        console.log('='.repeat(80));

        const result = await client.query(
            'SELECT * FROM aadhaar_details WHERE aadhaar_number = $1',
            [aadhaarNumber]
        );

        if (result.rows.length > 0) {
            const record = result.rows[0];
            console.log(`\n✅ Found record:`);
            console.log(`   Name: ${record.name}`);
            console.log(`   Aadhaar: ${record.aadhaar_number}`);
            console.log(`   DOB: ${record.date_of_birth?.toISOString().split('T')[0] || 'N/A'}`);
            console.log(`   Gender: ${record.gender}`);
            console.log(`   Address: ${record.address}`);
            console.log(`   Phone: ${record.phone_number || 'N/A'}`);
            console.log(`   Email: ${record.email || 'N/A'}`);
        } else {
            console.log(`\n❌ No record found for Aadhaar number: ${aadhaarNumber}`);
        }
    } finally {
        client.release();
    }
}

/**
 * Example 2: Search by name (partial match, case-insensitive)
 */
async function searchByName(name: string) {
    const client = await pool.connect();
    try {
        console.log(`\n🔍 Searching by Name: "${name}"`);
        console.log('='.repeat(80));

        const result = await client.query(
            'SELECT * FROM aadhaar_details WHERE LOWER(name) LIKE LOWER($1)',
            [`%${name}%`]
        );

        if (result.rows.length > 0) {
            console.log(`\n✅ Found ${result.rows.length} record(s):\n`);
            result.rows.forEach((record, index) => {
                console.log(`${index + 1}. ${record.name}`);
                console.log(`   Aadhaar: ${record.aadhaar_number}`);
                console.log(`   DOB: ${record.date_of_birth?.toISOString().split('T')[0] || 'N/A'}`);
                console.log(`   Gender: ${record.gender}`);
                console.log(`   Address: ${record.address}`);
                console.log();
            });
        } else {
            console.log(`\n❌ No records found matching name: "${name}"`);
        }
    } finally {
        client.release();
    }
}

/**
 * Example 3: Search by gender
 */
async function searchByGender(gender: string) {
    const client = await pool.connect();
    try {
        console.log(`\n🔍 Searching by Gender: ${gender}`);
        console.log('='.repeat(80));

        const result = await client.query(
            'SELECT * FROM aadhaar_details WHERE LOWER(gender) = LOWER($1)',
            [gender]
        );

        console.log(`\n✅ Found ${result.rows.length} record(s) with gender "${gender}":\n`);
        result.rows.forEach((record, index) => {
            console.log(`${index + 1}. ${record.name} - ${record.aadhaar_number}`);
        });
    } finally {
        client.release();
    }
}

/**
 * Example 4: Search by address (partial match)
 */
async function searchByAddress(addressKeyword: string) {
    const client = await pool.connect();
    try {
        console.log(`\n🔍 Searching by Address containing: "${addressKeyword}"`);
        console.log('='.repeat(80));

        const result = await client.query(
            'SELECT * FROM aadhaar_details WHERE LOWER(address) LIKE LOWER($1)',
            [`%${addressKeyword}%`]
        );

        if (result.rows.length > 0) {
            console.log(`\n✅ Found ${result.rows.length} record(s):\n`);
            result.rows.forEach((record, index) => {
                console.log(`${index + 1}. ${record.name}`);
                console.log(`   Address: ${record.address}`);
                console.log(`   Aadhaar: ${record.aadhaar_number}`);
                console.log();
            });
        } else {
            console.log(`\n❌ No records found with address containing: "${addressKeyword}"`);
        }
    } finally {
        client.release();
    }
}

/**
 * Example 5: Search by date of birth range
 */
async function searchByDOBRange(startDate: string, endDate: string) {
    const client = await pool.connect();
    try {
        console.log(`\n🔍 Searching by Date of Birth between ${startDate} and ${endDate}`);
        console.log('='.repeat(80));

        const result = await client.query(
            'SELECT * FROM aadhaar_details WHERE date_of_birth BETWEEN $1 AND $2',
            [startDate, endDate]
        );

        if (result.rows.length > 0) {
            console.log(`\n✅ Found ${result.rows.length} record(s):\n`);
            result.rows.forEach((record, index) => {
                console.log(`${index + 1}. ${record.name}`);
                console.log(`   DOB: ${record.date_of_birth?.toISOString().split('T')[0]}`);
                console.log(`   Aadhaar: ${record.aadhaar_number}`);
                console.log();
            });
        } else {
            console.log(`\n❌ No records found in date range`);
        }
    } finally {
        client.release();
    }
}

/**
 * Example 6: Advanced search with multiple criteria
 */
async function advancedSearch(criteria: {
    name?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
    addressKeyword?: string;
}) {
    const client = await pool.connect();
    try {
        console.log(`\n🔍 Advanced Search with criteria:`, criteria);
        console.log('='.repeat(80));

        let query = 'SELECT * FROM aadhaar_details WHERE 1=1';
        const params: any[] = [];

        if (criteria.name) {
            params.push(`%${criteria.name}%`);
            query += ` AND LOWER(name) LIKE LOWER($${params.length})`;
        }

        if (criteria.gender) {
            params.push(criteria.gender);
            query += ` AND LOWER(gender) = LOWER($${params.length})`;
        }

        if (criteria.minAge || criteria.maxAge) {
            const currentYear = new Date().getFullYear();

            if (criteria.maxAge) {
                const minYear = currentYear - criteria.maxAge;
                params.push(`${minYear}-01-01`);
                query += ` AND date_of_birth >= $${params.length}`;
            }

            if (criteria.minAge) {
                const maxYear = currentYear - criteria.minAge;
                params.push(`${maxYear}-12-31`);
                query += ` AND date_of_birth <= $${params.length}`;
            }
        }

        if (criteria.addressKeyword) {
            params.push(`%${criteria.addressKeyword}%`);
            query += ` AND LOWER(address) LIKE LOWER($${params.length})`;
        }

        query += ' ORDER BY created_at DESC';

        const result = await client.query(query, params);

        if (result.rows.length > 0) {
            console.log(`\n✅ Found ${result.rows.length} matching record(s):\n`);
            result.rows.forEach((record, index) => {
                console.log(`${index + 1}. ${record.name}`);
                console.log(`   Aadhaar: ${record.aadhaar_number}`);
                console.log(`   DOB: ${record.date_of_birth?.toISOString().split('T')[0] || 'N/A'}`);
                console.log(`   Gender: ${record.gender}`);
                console.log(`   Address: ${record.address}`);
                console.log();
            });
        } else {
            console.log(`\n❌ No records found matching the criteria`);
        }
    } finally {
        client.release();
    }
}

/**
 * Example 7: Search with pagination
 */
async function searchWithPagination(page: number = 1, pageSize: number = 10) {
    const client = await pool.connect();
    try {
        const offset = (page - 1) * pageSize;

        console.log(`\n🔍 Fetching page ${page} (${pageSize} records per page)`);
        console.log('='.repeat(80));

        // Get total count
        const countResult = await client.query('SELECT COUNT(*) FROM aadhaar_details');
        const totalRecords = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalRecords / pageSize);

        // Get paginated results
        const result = await client.query(
            'SELECT * FROM aadhaar_details ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [pageSize, offset]
        );

        console.log(`\n📊 Total Records: ${totalRecords} | Page ${page} of ${totalPages}\n`);

        result.rows.forEach((record, index) => {
            console.log(`${offset + index + 1}. ${record.name} - ${record.aadhaar_number}`);
        });
    } finally {
        client.release();
    }
}

// Main function to run all examples
async function runExamples() {
    try {
        console.log('\n🎯 AADHAAR DATABASE SEARCH EXAMPLES\n');
        console.log('='.repeat(80));
        console.log('This script demonstrates various ways to search Aadhaar details\n');

        // Example 1: Search by exact Aadhaar number
        // Replace with actual Aadhaar number from your database
        await searchByAadhaarNumber('123456789012');

        // Example 2: Search by name
        await searchByName('John');

        // Example 3: Search by gender
        await searchByGender('Male');

        // Example 4: Search by address
        await searchByAddress('Mumbai');

        // Example 5: Search by date range
        await searchByDOBRange('1990-01-01', '2000-12-31');

        // Example 6: Advanced search
        await advancedSearch({
            gender: 'Female',
            minAge: 25,
            maxAge: 35,
            addressKeyword: 'Delhi'
        });

        // Example 7: Pagination
        await searchWithPagination(1, 5);

        console.log('\n' + '='.repeat(80));
        console.log('✨ All search examples completed!\n');

    } catch (error: any) {
        console.error('❌ Error running examples:', error.message);
    } finally {
        await pool.end();
    }
}

// Run examples
runExamples();

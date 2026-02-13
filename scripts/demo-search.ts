import { searchAadhaarDetails, quickSearchByAadhaar, quickSearchByName } from '../lib/search';
import * as dotenv from 'dotenv';

dotenv.config();

async function demo() {
    console.log('='.repeat(60));
    console.log('AADHAAR DATABASE SEARCH DEMO');
    console.log('='.repeat(60));
    console.log();

    try {
        // Demo 1: Get all records with pagination
        console.log('DEMO 1: Get All Records (Page 1, 5 per page)');
        console.log('-'.repeat(60));
        const allResults = await searchAadhaarDetails({ page: 1, pageSize: 5 });
        console.log(`Total Records: ${allResults.total}`);
        console.log(`Page: ${allResults.page} of ${allResults.totalPages}`);
        console.log(`Showing: ${allResults.data.length} records\n`);

        allResults.data.forEach((record, index) => {
            console.log(`${index + 1}. ${record.name}`);
            console.log(`   Aadhaar: ${record.aadhaar_number}`);
            console.log(`   Gender: ${record.gender} | DOB: ${record.date_of_birth?.toISOString().split('T')[0]}`);
            console.log(`   Address: ${record.address}`);
            console.log();
        });

        if (allResults.data.length > 0) {
            const firstRecord = allResults.data[0];

            // Demo 2: Search by exact Aadhaar number
            console.log('='.repeat(60));
            console.log('DEMO 2: Quick Search by Aadhaar Number');
            console.log('-'.repeat(60));
            console.log(`Searching: ${firstRecord.aadhaar_number}\n`);

            const exactMatch = await quickSearchByAadhaar(firstRecord.aadhaar_number);
            if (exactMatch) {
                console.log('FOUND!');
                console.log(`Name: ${exactMatch.name}`);
                console.log(`Gender: ${exactMatch.gender}`);
                console.log(`Phone: ${exactMatch.phone_number || 'N/A'}`);
                console.log(`Email: ${exactMatch.email || 'N/A'}`);
            }
            console.log();

            // Demo 3: Search by name
            console.log('='.repeat(60));
            console.log('DEMO 3: Search by Name (Partial Match)');
            console.log('-'.repeat(60));
            const nameToSearch = firstRecord.name.split(' ')[0];
            console.log(`Searching names containing: "${nameToSearch}"\n`);

            const nameResults = await quickSearchByName(nameToSearch);
            console.log(`Found ${nameResults.length} matching record(s):`);
            nameResults.forEach((r, i) => {
                console.log(`${i + 1}. ${r.name} - ${r.aadhaar_number}`);
            });
            console.log();

            // Demo 4: Search by gender
            console.log('='.repeat(60));
            console.log('DEMO 4: Search by Gender');
            console.log('-'.repeat(60));
            console.log(`Searching: ${firstRecord.gender}\n`);

            const genderResults = await searchAadhaarDetails({ gender: firstRecord.gender });
            console.log(`Found ${genderResults.total} record(s):`);
            genderResults.data.forEach((r, i) => {
                console.log(`${i + 1}. ${r.name} (${r.gender})`);
            });
            console.log();

            // Demo 5: Advanced multi-criteria search
            console.log('='.repeat(60));
            console.log('DEMO 5: Advanced Search (Multiple Criteria)');
            console.log('-'.repeat(60));
            const addressPart = firstRecord.address?.split(',').pop()?.trim() || 'India';
            console.log(`Criteria: Gender=${firstRecord.gender}, Address contains="${addressPart}"\n`);

            const advancedResults = await searchAadhaarDetails({
                gender: firstRecord.gender,
                addressKeyword: addressPart,
                page: 1,
                pageSize: 10
            });

            console.log(`Found ${advancedResults.total} matching record(s):`);
            advancedResults.data.forEach((r, i) => {
                console.log(`${i + 1}. ${r.name}`);
                console.log(`   Gender: ${r.gender} | Address: ${r.address}`);
            });
        }

        console.log();
        console.log('='.repeat(60));
        console.log('DEMO COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log();

    } catch (error: any) {
        console.error('\nERROR:', error.message);
        console.error(error);
    }

    process.exit(0);
}

demo();

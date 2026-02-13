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

const testData = [
  {
    aadhaar_number: '123456789012',
    name: 'Rajesh Kumar',
    date_of_birth: '1990-05-15',
    gender: 'Male',
    address: '123 Main Street, Sector 5, New Delhi, Delhi 110001',
    phone_number: '9876543210',
    email: 'rajesh.kumar@example.com',
  },
  {
    aadhaar_number: '234567890123',
    name: 'Priya Sharma',
    date_of_birth: '1992-08-22',
    gender: 'Female',
    address: '456 Park Avenue, Andheri West, Mumbai, Maharashtra 400053',
    phone_number: '9876543211',
    email: 'priya.sharma@example.com',
  },
  {
    aadhaar_number: '345678901234',
    name: 'Amit Patel',
    date_of_birth: '1988-12-10',
    gender: 'Male',
    address: '789 MG Road, Koramangala, Bangalore, Karnataka 560095',
    phone_number: '9876543212',
    email: 'amit.patel@example.com',
  },
  {
    aadhaar_number: '456789012345',
    name: 'Sneha Reddy',
    date_of_birth: '1995-03-18',
    gender: 'Female',
    address: '321 Brigade Road, HSR Layout, Bangalore, Karnataka 560102',
    phone_number: '9876543213',
    email: 'sneha.reddy@example.com',
  },
  {
    aadhaar_number: '567890123456',
    name: 'Vikram Singh',
    date_of_birth: '1987-07-25',
    gender: 'Male',
    address: '654 Connaught Place, Central Delhi, New Delhi, Delhi 110001',
    phone_number: '9876543214',
    email: 'vikram.singh@example.com',
  },
  {
    aadhaar_number: '678901234567',
    name: 'Anjali Desai',
    date_of_birth: '1993-11-30',
    gender: 'Female',
    address: '987 Marine Drive, Colaba, Mumbai, Maharashtra 400005',
    phone_number: '9876543215',
    email: 'anjali.desai@example.com',
  },
  {
    aadhaar_number: '789012345678',
    name: 'Rahul Mehta',
    date_of_birth: '1991-02-14',
    gender: 'Male',
    address: '147 Banjara Hills, Hyderabad, Telangana 500034',
    phone_number: '9876543216',
    email: 'rahul.mehta@example.com',
  },
  {
    aadhaar_number: '890123456789',
    name: 'Kavita Nair',
    date_of_birth: '1994-09-05',
    gender: 'Female',
    address: '258 Jubilee Hills, Hyderabad, Telangana 500033',
    phone_number: '9876543217',
    email: 'kavita.nair@example.com',
  },
];

async function addTestData() {
  const client = await pool.connect();
  
  try {
    console.log('Adding test data to database...\n');
    
    for (const data of testData) {
      try {
        const result = await client.query(
          `INSERT INTO aadhaar_details 
           (aadhaar_number, name, date_of_birth, gender, address, phone_number, email)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (aadhaar_number) 
           DO UPDATE SET 
             name = EXCLUDED.name,
             date_of_birth = EXCLUDED.date_of_birth,
             gender = EXCLUDED.gender,
             address = EXCLUDED.address,
             phone_number = EXCLUDED.phone_number,
             email = EXCLUDED.email,
             updated_at = CURRENT_TIMESTAMP
           RETURNING aadhaar_number, name`,
          [
            data.aadhaar_number,
            data.name,
            data.date_of_birth,
            data.gender,
            data.address,
            data.phone_number,
            data.email,
          ]
        );
        
        console.log(`✅ Added/Updated: ${result.rows[0].aadhaar_number} - ${result.rows[0].name}`);
      } catch (error: any) {
        console.error(`❌ Error adding ${data.aadhaar_number}:`, error.message);
      }
    }
    
    console.log('\n✨ Test data insertion completed!');
    console.log(`\nTotal records added/updated: ${testData.length}`);
    console.log('\nYou can now search for these Aadhaar numbers:');
    testData.forEach((data) => {
      console.log(`  - ${data.aadhaar_number} (${data.name})`);
    });
    
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addTestData();

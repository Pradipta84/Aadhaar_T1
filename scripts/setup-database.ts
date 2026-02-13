import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  // First, connect to postgres database to create our database
  const adminClient = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default postgres database
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL server\n');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'aadhaar_db';
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      // Create database
      console.log(`Creating database: ${dbName}...`);
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully!\n`);
    } else {
      console.log(`✅ Database '${dbName}' already exists\n`);
    }

    await adminClient.end();

    // Now connect to the new database to create tables
    const appClient = new Client({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
    });

    await appClient.connect();
    console.log(`Connected to ${dbName} database\n`);

    // Create aadhaar_details table
    console.log('Creating aadhaar_details table...');
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS aadhaar_details (
        id SERIAL PRIMARY KEY,
        aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(10),
        address TEXT,
        phone_number VARCHAR(15),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table created successfully!\n');

    // Create index on aadhaar_number for faster lookups
    console.log('Creating index on aadhaar_number...');
    await appClient.query(`
      CREATE INDEX IF NOT EXISTS idx_aadhaar_number 
      ON aadhaar_details(aadhaar_number)
    `);
    console.log('✅ Index created successfully!\n');

    await appClient.end();

    console.log('🎉 Database setup completed successfully!');
    console.log('\nYou can now run: npx tsx scripts/add-test-data.ts');
    
  } catch (error: any) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();

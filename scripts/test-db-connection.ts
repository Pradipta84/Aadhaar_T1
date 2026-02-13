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

async function testConnection() {
  console.log('Testing database connection...\n');
  console.log('Connection settings:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'aadhaar_db'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}\n`);

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name, current_user as db_user');
    console.log('✅ Database connection successful!');
    console.log(`  Current Time: ${result.rows[0].current_time}`);
    console.log(`  Database: ${result.rows[0].db_name}`);
    console.log(`  User: ${result.rows[0].db_user}`);
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'aadhaar_details'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('  ✅ Table "aadhaar_details" exists');
    } else {
      console.log('  ⚠️  Table "aadhaar_details" does not exist. Run /api/init-db to create it.');
    }
    
  } catch (error: any) {
    console.error('❌ Database connection failed!\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Error: Cannot connect to PostgreSQL server.');
      console.error('  - Make sure PostgreSQL is running');
      console.error('  - Check if the host and port are correct');
    } else if (error.code === '28P01') {
      console.error('Error: Authentication failed - wrong password or user.');
      console.error('  - Check your DB_USER and DB_PASSWORD in .env file');
      console.error('  - Make sure the PostgreSQL user exists and password is correct');
    } else if (error.code === '3D000') {
      console.error('Error: Database does not exist.');
      console.error(`  - Create the database: CREATE DATABASE ${process.env.DB_NAME || 'aadhaar_db'};`);
    } else {
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection();

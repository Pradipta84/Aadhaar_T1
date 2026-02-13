import { Pool } from 'pg';

// PostgreSQL connection pool - lazy init for Vercel serverless (avoids build-time connection)
const getPoolConfig = () => {
  if (process.env.DATABASE_URL) {
    const isCloudDb = [
      'amazonaws.com',
      'azure.com',
      'heroku.com',
      'neon.tech',
      'supabase.co',
      'supabase.com',
      'pooler.supabase.com',
      'vercel-storage.com',
    ].some((host) => process.env.DATABASE_URL!.includes(host));
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: isCloudDb ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      max: process.env.VERCEL ? 1 : 10,
    };
  }
  return {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aadhaar_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    connectionTimeoutMillis: 10000,
  };
};

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool(getPoolConfig());
  }
  return pool;
}

// Initialize database schema
export async function initDatabase() {
  try {
    const client = await getPool().connect();
    
    // Create aadhaar_details table if it doesn't exist
    await client.query(`
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

    // Create index on aadhaar_number for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_aadhaar_number 
      ON aadhaar_details(aadhaar_number)
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get Aadhaar details by number
export async function getAadhaarDetails(aadhaarNumber: string) {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      'SELECT * FROM aadhaar_details WHERE aadhaar_number = $1',
      [aadhaarNumber]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching Aadhaar details:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Save Aadhaar details
export async function saveAadhaarDetails(data: {
  aadhaar_number: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone_number?: string;
  email?: string;
}) {
  const client = await getPool().connect();
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
       RETURNING *`,
      [
        data.aadhaar_number,
        data.name,
        data.date_of_birth || null,
        data.gender || null,
        data.address || null,
        data.phone_number || null,
        data.email || null,
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving Aadhaar details:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all Aadhaar details
export async function getAllAadhaarDetails() {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      'SELECT * FROM aadhaar_details ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching all Aadhaar details:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default getPool;

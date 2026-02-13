/**
 * Database layer for Vercel deployment
 * - Vercel: uses @neondatabase/serverless (no pg, no bundling issues)
 * - Local: uses pg when DATABASE_URL not set
 */

import { neon } from '@neondatabase/serverless';

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME || 'aadhaar_db';

  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function useNeon(): boolean {
  return !!process.env.DATABASE_URL;
}

async function queryWithPg(sql: string, params?: unknown[]) {
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: getConnectionString(),
    ssl: false,
  });
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } finally {
    await pool.end();
  }
}

// Initialize database schema
export async function initDatabase() {
  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Add it in Vercel Project Settings. Get a free DB at neon.tech'
    );
  }

  if (useNeon()) {
    const sql = neon(getConnectionString());
    await sql`
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
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_aadhaar_number
      ON aadhaar_details(aadhaar_number)
    `;
  } else {
    await queryWithPg(`
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
    await queryWithPg(`
      CREATE INDEX IF NOT EXISTS idx_aadhaar_number
      ON aadhaar_details(aadhaar_number)
    `);
  }
}

// Get Aadhaar details by number
export async function getAadhaarDetails(aadhaarNumber: string) {
  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (useNeon()) {
    const sql = neon(getConnectionString());
    const rows = await sql`
      SELECT * FROM aadhaar_details
      WHERE aadhaar_number = ${aadhaarNumber}
    `;
    return rows[0] || null;
  }

  const rows = await queryWithPg(
    'SELECT * FROM aadhaar_details WHERE aadhaar_number = $1',
    [aadhaarNumber]
  );
  return rows[0] || null;
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
  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (useNeon()) {
    const sql = neon(getConnectionString());
    const rows = await sql`
      INSERT INTO aadhaar_details
        (aadhaar_number, name, date_of_birth, gender, address, phone_number, email)
      VALUES (
        ${data.aadhaar_number},
        ${data.name},
        ${data.date_of_birth || null},
        ${data.gender || null},
        ${data.address || null},
        ${data.phone_number || null},
        ${data.email || null}
      )
      ON CONFLICT (aadhaar_number) DO UPDATE SET
        name = EXCLUDED.name,
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        address = EXCLUDED.address,
        phone_number = EXCLUDED.phone_number,
        email = EXCLUDED.email,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return rows[0];
  }

  const rows = await queryWithPg(
    `INSERT INTO aadhaar_details
      (aadhaar_number, name, date_of_birth, gender, address, phone_number, email)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (aadhaar_number) DO UPDATE SET
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
  return rows[0];
}

// Get all Aadhaar details
export async function getAllAadhaarDetails() {
  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (useNeon()) {
    const sql = neon(getConnectionString());
    return sql`
      SELECT * FROM aadhaar_details
      ORDER BY created_at DESC
    `;
  }

  return queryWithPg('SELECT * FROM aadhaar_details ORDER BY created_at DESC');
}

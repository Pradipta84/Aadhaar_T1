-- PostgreSQL Database Initialization Script
-- Run this script to manually create the database schema

-- Create database (run this separately if database doesn't exist)
-- CREATE DATABASE aadhaar_db;

-- Connect to the database
-- \c aadhaar_db;

-- Create aadhaar_details table
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
);

-- Create index on aadhaar_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_aadhaar_number 
ON aadhaar_details(aadhaar_number);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_aadhaar_details_updated_at 
BEFORE UPDATE ON aadhaar_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT * FROM aadhaar_details LIMIT 0;

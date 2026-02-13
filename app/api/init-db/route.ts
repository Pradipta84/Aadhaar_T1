import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

// Initialize database schema
export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json(
      { success: true, message: 'Database initialized successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error initializing database:', error);
    
    let errorMessage = 'Failed to initialize database';
    
    // Provide specific error messages
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = 'Database connection failed. Please check if PostgreSQL is running and the connection settings in .env file.';
    } else if (error.code === '28P01' || error.message?.includes('password')) {
      errorMessage = 'Database authentication failed. Please check your database credentials in .env file.';
    } else if (error.code === '3D000') {
      errorMessage = 'Database does not exist. Please create the database first.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

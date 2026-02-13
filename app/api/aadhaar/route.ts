import { NextRequest, NextResponse } from 'next/server';
import { getAadhaarDetails, saveAadhaarDetails, getAllAadhaarDetails } from '@/lib/db';
import { AadhaarFormData } from '@/types/aadhaar';

// GET - Fetch Aadhaar details by number or get all
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aadhaarNumber = searchParams.get('aadhaar_number');

    if (aadhaarNumber) {
      // Fetch specific Aadhaar details
      const details = await getAadhaarDetails(aadhaarNumber);
      
      if (!details) {
        return NextResponse.json(
          { error: 'Aadhaar details not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: details });
    } else {
      // Fetch all Aadhaar details
      const allDetails = await getAllAadhaarDetails();
      return NextResponse.json({ success: true, data: allDetails });
    }
  } catch (error: any) {
    console.error('Error fetching Aadhaar details:', error);
    
    // Check for database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your database configuration.' },
        { status: 503 }
      );
    }
    
    if (error.code === '28P01' || error.message?.includes('password')) {
      return NextResponse.json(
        { error: 'Database authentication failed. Please check your database credentials.' },
        { status: 503 }
      );
    }
    
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'Database table not found. Please initialize the database first.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Aadhaar details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Save Aadhaar details
export async function POST(request: NextRequest) {
  try {
    const body: AadhaarFormData = await request.json();
    const { aadhaar_number, name } = body;

    // Validate required fields
    if (!aadhaar_number || !name) {
      return NextResponse.json(
        { error: 'Aadhaar number and name are required' },
        { status: 400 }
      );
    }

    // Validate Aadhaar number format (12 digits)
    if (!/^\d{12}$/.test(aadhaar_number)) {
      return NextResponse.json(
        { error: 'Invalid Aadhaar number format. Must be 12 digits' },
        { status: 400 }
      );
    }

    // Save to database
    const savedDetails = await saveAadhaarDetails(body);

    return NextResponse.json(
      { success: true, data: savedDetails, message: 'Aadhaar details saved successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving Aadhaar details:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Aadhaar number already exists' },
        { status: 409 }
      );
    }
    
    // Check for database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your database configuration.' },
        { status: 503 }
      );
    }
    
    if (error.code === '28P01' || error.message?.includes('password')) {
      return NextResponse.json(
        { error: 'Database authentication failed. Please check your database credentials.' },
        { status: 503 }
      );
    }
    
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'Database table not found. Please initialize the database first.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to save Aadhaar details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

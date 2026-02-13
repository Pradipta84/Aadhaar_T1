import { NextResponse } from 'next/server';
import { saveAadhaarDetails } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

// POST - Add test data
export async function POST() {
  try {
    const results = [];
    const errors = [];

    for (const data of testData) {
      try {
        const saved = await saveAadhaarDetails(data);
        results.push({
          aadhaar_number: saved.aadhaar_number,
          name: saved.name,
          status: 'success',
        });
      } catch (error: any) {
        errors.push({
          aadhaar_number: data.aadhaar_number,
          name: data.name,
          error: error.message,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Test data added successfully. ${results.length} records added/updated.`,
        added: results,
        errors: errors.length > 0 ? errors : undefined,
        total: testData.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error adding test data:', error);
    return NextResponse.json(
      { error: 'Failed to add test data', details: error.message },
      { status: 500 }
    );
  }
}

// GET - List test data Aadhaar numbers
export async function GET() {
  return NextResponse.json({
    message: 'Test data available',
    test_aadhaar_numbers: testData.map((d) => ({
      aadhaar_number: d.aadhaar_number,
      name: d.name,
    })),
    instructions: 'POST to /api/test-data to add test data to database',
  });
}

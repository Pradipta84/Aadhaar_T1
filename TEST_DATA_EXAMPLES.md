# Test Data Examples

Here are the 8 sample Aadhaar records that can be added to your database:

## Test Data List

### 1. Rajesh Kumar
- **Aadhaar Number:** `123456789012`
- **Name:** Rajesh Kumar
- **Date of Birth:** 1990-05-15
- **Gender:** Male
- **Address:** 123 Main Street, Sector 5, New Delhi, Delhi 110001
- **Phone:** 9876543210
- **Email:** rajesh.kumar@example.com

### 2. Priya Sharma
- **Aadhaar Number:** `234567890123`
- **Name:** Priya Sharma
- **Date of Birth:** 1992-08-22
- **Gender:** Female
- **Address:** 456 Park Avenue, Andheri West, Mumbai, Maharashtra 400053
- **Phone:** 9876543211
- **Email:** priya.sharma@example.com

### 3. Amit Patel
- **Aadhaar Number:** `345678901234`
- **Name:** Amit Patel
- **Date of Birth:** 1988-12-10
- **Gender:** Male
- **Address:** 789 MG Road, Koramangala, Bangalore, Karnataka 560095
- **Phone:** 9876543212
- **Email:** amit.patel@example.com

### 4. Sneha Reddy
- **Aadhaar Number:** `456789012345`
- **Name:** Sneha Reddy
- **Date of Birth:** 1995-03-18
- **Gender:** Female
- **Address:** 321 Brigade Road, HSR Layout, Bangalore, Karnataka 560102
- **Phone:** 9876543213
- **Email:** sneha.reddy@example.com

### 5. Vikram Singh
- **Aadhaar Number:** `567890123456`
- **Name:** Vikram Singh
- **Date of Birth:** 1987-07-25
- **Gender:** Male
- **Address:** 654 Connaught Place, Central Delhi, New Delhi, Delhi 110001
- **Phone:** 9876543214
- **Email:** vikram.singh@example.com

### 6. Anjali Desai
- **Aadhaar Number:** `678901234567`
- **Name:** Anjali Desai
- **Date of Birth:** 1993-11-30
- **Gender:** Female
- **Address:** 987 Marine Drive, Colaba, Mumbai, Maharashtra 400005
- **Phone:** 9876543215
- **Email:** anjali.desai@example.com

### 7. Rahul Mehta
- **Aadhaar Number:** `789012345678`
- **Name:** Rahul Mehta
- **Date of Birth:** 1991-02-14
- **Gender:** Male
- **Address:** 147 Banjara Hills, Hyderabad, Telangana 500034
- **Phone:** 9876543216
- **Email:** rahul.mehta@example.com

### 8. Kavita Nair
- **Aadhaar Number:** `890123456789`
- **Name:** Kavita Nair
- **Date of Birth:** 1994-09-05
- **Gender:** Female
- **Address:** 258 Jubilee Hills, Hyderabad, Telangana 500033
- **Phone:** 9876543217
- **Email:** kavita.nair@example.com

## How to Add Test Data

### Method 1: Using API Endpoint (Recommended)

**If server is running:**

1. **Using Browser:**
   - Visit: `http://localhost:3000/api/test-data` (GET to see list)
   - To add: Use a tool like Postman or run PowerShell command below

2. **Using PowerShell:**
   ```powershell
   Invoke-RestMethod -Uri http://localhost:3000/api/test-data -Method POST
   ```

### Method 2: Using Script

```powershell
npm run add-test-data
```

### Method 3: Using Browser (Manual)

1. Start server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Use the form to add each record manually

## Quick Test Aadhaar Numbers

You can search for these Aadhaar numbers after adding test data:

- `123456789012` - Rajesh Kumar
- `234567890123` - Priya Sharma
- `345678901234` - Amit Patel
- `456789012345` - Sneha Reddy
- `567890123456` - Vikram Singh
- `678901234567` - Anjali Desai
- `789012345678` - Rahul Mehta
- `890123456789` - Kavita Nair

## Test Data Format

All test data follows this structure:
- **Aadhaar Number:** 12 digits (required, unique)
- **Name:** Full name (required)
- **Date of Birth:** YYYY-MM-DD format
- **Gender:** Male/Female/Other
- **Address:** Complete address with city and PIN code
- **Phone Number:** 10 digits
- **Email:** Valid email format

## Notes

- All Aadhaar numbers are fictional (for testing only)
- Phone numbers and emails are example data
- Addresses are real locations but fictional residents
- Data can be added multiple times (will update existing records)

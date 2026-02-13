# Complete Fix: Database Setup + Add Test Data

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Complete Database Setup & Test Data" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Get PostgreSQL password
Write-Host "Step 1: Database Configuration" -ForegroundColor Yellow
Write-Host "Enter your PostgreSQL password:" -ForegroundColor White
$password = Read-Host "Password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Step 2: Update .env
Write-Host "`nUpdating .env file..." -ForegroundColor Yellow
$envContent = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=$plainPassword
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
Write-Host "✅ .env file updated!" -ForegroundColor Green

# Step 3: Test connection
Write-Host "`nStep 2: Testing Database Connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $plainPassword

try {
    $testResult = & psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
        
        # Step 4: Create database if needed
        Write-Host "`nStep 3: Checking/Creating Database..." -ForegroundColor Yellow
        $dbExists = & psql -h localhost -p 5432 -U postgres -lqt 2>&1 | Select-String "aadhaar_db"
        
        if (-not $dbExists) {
            Write-Host "Creating database 'aadhaar_db'..." -ForegroundColor Gray
            & createdb -h localhost -p 5432 -U postgres aadhaar_db 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database created!" -ForegroundColor Green
            }
        } else {
            Write-Host "✅ Database exists!" -ForegroundColor Green
        }
        
        # Step 5: Initialize database schema
        Write-Host "`nStep 4: Initializing Database Schema..." -ForegroundColor Yellow
        
        $initSQL = @"
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

CREATE INDEX IF NOT EXISTS idx_aadhaar_number ON aadhaar_details(aadhaar_number);
"@
        
        $initSQL | & psql -h localhost -p 5432 -U postgres -d aadhaar_db 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database schema initialized!" -ForegroundColor Green
        }
        
        # Step 6: Add test data
        Write-Host "`nStep 5: Adding Test Data..." -ForegroundColor Yellow
        
        $testDataSQL = @"
INSERT INTO aadhaar_details (aadhaar_number, name, date_of_birth, gender, address, phone_number, email)
VALUES 
  ('123456789012', 'Rajesh Kumar', '1990-05-15', 'Male', '123 Main Street, Sector 5, New Delhi, Delhi 110001', '9876543210', 'rajesh.kumar@example.com'),
  ('234567890123', 'Priya Sharma', '1992-08-22', 'Female', '456 Park Avenue, Andheri West, Mumbai, Maharashtra 400053', '9876543211', 'priya.sharma@example.com'),
  ('345678901234', 'Amit Patel', '1988-12-10', 'Male', '789 MG Road, Koramangala, Bangalore, Karnataka 560095', '9876543212', 'amit.patel@example.com'),
  ('456789012345', 'Sneha Reddy', '1995-03-18', 'Female', '321 Brigade Road, HSR Layout, Bangalore, Karnataka 560102', '9876543213', 'sneha.reddy@example.com'),
  ('567890123456', 'Vikram Singh', '1987-07-25', 'Male', '654 Connaught Place, Central Delhi, New Delhi, Delhi 110001', '9876543214', 'vikram.singh@example.com'),
  ('678901234567', 'Anjali Desai', '1993-11-30', 'Female', '987 Marine Drive, Colaba, Mumbai, Maharashtra 400005', '9876543215', 'anjali.desai@example.com'),
  ('789012345678', 'Rahul Mehta', '1991-02-14', 'Male', '147 Banjara Hills, Hyderabad, Telangana 500034', '9876543216', 'rahul.mehta@example.com'),
  ('890123456789', 'Kavita Nair', '1994-09-05', 'Female', '258 Jubilee Hills, Hyderabad, Telangana 500033', '9876543217', 'kavita.nair@example.com')
ON CONFLICT (aadhaar_number) 
DO UPDATE SET 
  name = EXCLUDED.name,
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  address = EXCLUDED.address,
  phone_number = EXCLUDED.phone_number,
  email = EXCLUDED.email,
  updated_at = CURRENT_TIMESTAMP;
"@
        
        $testDataSQL | & psql -h localhost -p 5432 -U postgres -d aadhaar_db 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Test data added successfully!" -ForegroundColor Green
            
            # Verify data
            Write-Host "`nStep 6: Verifying Test Data..." -ForegroundColor Yellow
            $verifyResult = & psql -h localhost -p 5432 -U postgres -d aadhaar_db -c "SELECT COUNT(*) as count FROM aadhaar_details;" 2>&1
            $count = ($verifyResult | Select-String "\d+").Matches.Value
            
            Write-Host "✅ Found $count records in database!" -ForegroundColor Green
            
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Green
            
            Write-Host "Test Aadhaar Numbers:" -ForegroundColor Cyan
            Write-Host "  123456789012 - Rajesh Kumar" -ForegroundColor White
            Write-Host "  234567890123 - Priya Sharma" -ForegroundColor White
            Write-Host "  345678901234 - Amit Patel" -ForegroundColor White
            Write-Host "  ... and 5 more`n" -ForegroundColor White
            
            Write-Host "Next Steps:" -ForegroundColor Yellow
            Write-Host "1. Start server: npm run dev" -ForegroundColor White
            Write-Host "2. Open: http://localhost:3000" -ForegroundColor White
            Write-Host "3. Search for: 123456789012" -ForegroundColor White
            Write-Host "4. You should see Rajesh Kumar's details!`n" -ForegroundColor White
            
        } else {
            Write-Host "⚠️  Error adding test data, but you can add it manually later" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Database connection failed!" -ForegroundColor Red
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "- PostgreSQL is running" -ForegroundColor White
        Write-Host "- Password is correct" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

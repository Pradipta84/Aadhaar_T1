# Complete Fix Script - Fixes all database issues

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Complete Database Fix" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = @()
$fixed = @()

# Step 1: Check .env file
Write-Host "Step 1: Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content .env -Raw
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
    
    # Check if DATABASE_URL or DB_PASSWORD is set
    if ($envContent -match "DATABASE_URL=") {
        $dbUrl = ($envContent | Select-String "DATABASE_URL=([^\r\n]+)").Matches.Groups[1].Value
        Write-Host "  ✅ DATABASE_URL found" -ForegroundColor Green
        if ($dbUrl -match "postgresql://.*:.*@") {
            Write-Host "  ✅ Connection string format looks valid" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Connection string might be incomplete" -ForegroundColor Yellow
            $errors += "Connection string format issue"
        }
    } elseif ($envContent -match "DB_PASSWORD=") {
        $dbPass = ($envContent | Select-String "DB_PASSWORD=([^\r\n]+)").Matches.Groups[1].Value
        if ($dbPass -eq "postgres" -or [string]::IsNullOrWhiteSpace($dbPass)) {
            Write-Host "  ⚠️  DB_PASSWORD is default or empty" -ForegroundColor Yellow
            Write-Host "  → This is likely the problem!" -ForegroundColor Red
            $errors += "Default password in .env"
        } else {
            Write-Host "  ✅ DB_PASSWORD is set" -ForegroundColor Green
        }
    } else {
        Write-Host "  ❌ No database configuration found" -ForegroundColor Red
        $errors += "No database config"
    }
} else {
    Write-Host "  ❌ .env file not found" -ForegroundColor Red
    $errors += ".env file missing"
}

# Step 2: Get PostgreSQL password
Write-Host "`nStep 2: Database Password Setup..." -ForegroundColor Yellow
if ($errors -contains ".env file missing" -or $errors -contains "Default password in .env") {
    Write-Host "  Enter your PostgreSQL password:" -ForegroundColor White
    $password = Read-Host "Password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    # Create/Update .env
    $envContent = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=$plainPassword
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
    Write-Host "  ✅ .env file created/updated" -ForegroundColor Green
    $fixed += "Created/updated .env file"
    $env:PGPASSWORD = $plainPassword
} else {
    # Try to extract password from .env
    if (Test-Path ".env") {
        $envContent = Get-Content .env -Raw
        if ($envContent -match "DB_PASSWORD=([^\r\n]+)") {
            $plainPassword = $Matches[1]
            $env:PGPASSWORD = $plainPassword
        } elseif ($envContent -match "DATABASE_URL=postgresql://[^:]+:([^@]+)@") {
            $plainPassword = $Matches[1]
            $env:PGPASSWORD = $plainPassword
        }
    }
}

# Step 3: Test database connection
Write-Host "`nStep 3: Testing Database Connection..." -ForegroundColor Yellow
try {
    $testResult = & psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Database connection successful!" -ForegroundColor Green
        $fixed += "Database connection verified"
    } else {
        Write-Host "  ❌ Database connection failed!" -ForegroundColor Red
        Write-Host "  Error: $testResult" -ForegroundColor Red
        $errors += "Database connection failed"
        Write-Host "`n⚠️  Please check:" -ForegroundColor Yellow
        Write-Host "  - PostgreSQL is running" -ForegroundColor White
        Write-Host "  - Password is correct" -ForegroundColor White
        Write-Host "  - User 'postgres' exists" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "  ❌ Error testing connection: $_" -ForegroundColor Red
    $errors += "Connection test error"
    exit 1
}

# Step 4: Check/Create database
Write-Host "`nStep 4: Checking Database..." -ForegroundColor Yellow
$dbExists = & psql -h localhost -p 5432 -U postgres -lqt 2>&1 | Select-String "aadhaar_db"

if (-not $dbExists) {
    Write-Host "  Creating database 'aadhaar_db'..." -ForegroundColor Gray
    & createdb -h localhost -p 5432 -U postgres aadhaar_db 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Database created!" -ForegroundColor Green
        $fixed += "Created database"
    } else {
        Write-Host "  ❌ Failed to create database" -ForegroundColor Red
        $errors += "Database creation failed"
    }
} else {
    Write-Host "  ✅ Database exists" -ForegroundColor Green
}

# Step 5: Initialize schema
Write-Host "`nStep 5: Initializing Database Schema..." -ForegroundColor Yellow
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
    Write-Host "  ✅ Schema initialized!" -ForegroundColor Green
    $fixed += "Schema initialized"
} else {
    Write-Host "  ⚠️  Schema might already exist" -ForegroundColor Yellow
}

# Step 6: Add test data
Write-Host "`nStep 6: Adding Test Data..." -ForegroundColor Yellow
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
    Write-Host "  ✅ Test data added!" -ForegroundColor Green
    $fixed += "Test data added"
} else {
    Write-Host "  ⚠️  Test data might already exist" -ForegroundColor Yellow
}

# Step 7: Verify data
Write-Host "`nStep 7: Verifying Data..." -ForegroundColor Yellow
$countResult = & psql -h localhost -p 5432 -U postgres -d aadhaar_db -t -c "SELECT COUNT(*) FROM aadhaar_details;" 2>&1
$count = ($countResult -replace '\s', '')

if ($count -match '\d+') {
    $count = [int]$count
    Write-Host "  ✅ Found $count records in database!" -ForegroundColor Green
    
    if ($count -gt 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "  ✅ ALL FIXES COMPLETE!" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Green
        
        Write-Host "Summary:" -ForegroundColor Cyan
        foreach ($fix in $fixed) {
            Write-Host "  ✅ $fix" -ForegroundColor Green
        }
        
        Write-Host "`nNext Steps:" -ForegroundColor Yellow
        Write-Host "1. Restart your Next.js server:" -ForegroundColor White
        Write-Host "   - Stop current server (Ctrl+C)" -ForegroundColor Gray
        Write-Host "   - Start: npm run dev" -ForegroundColor Gray
        Write-Host "`n2. Test the application:" -ForegroundColor White
        Write-Host "   - Open: http://localhost:3000" -ForegroundColor Gray
        Write-Host "   - Search for: 123456789012" -ForegroundColor Gray
        Write-Host "   - Should show: Rajesh Kumar details`n" -ForegroundColor Gray
        
    } else {
        Write-Host "  ⚠️  Database is empty" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  Could not verify data count" -ForegroundColor Yellow
}

Write-Host ""

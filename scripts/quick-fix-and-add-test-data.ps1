# Quick Fix: Enter password and add test data in one go

Write-Host "`n=== Quick Fix & Add Test Data ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get password
Write-Host "Enter your PostgreSQL password:" -ForegroundColor Yellow
$password = Read-Host "Password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Step 2: Update .env file
Write-Host "`nUpdating .env file..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content .env
    $updated = $envContent | ForEach-Object {
        if ($_ -match "^DB_PASSWORD=") {
            "DB_PASSWORD=$plainPassword"
        } else {
            $_
        }
    }
    $updated | Set-Content .env -Encoding UTF8
} else {
    $envContent = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aadhaar_db
DB_USER=postgres
DB_PASSWORD=$plainPassword
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host "✅ .env file updated!" -ForegroundColor Green

# Step 3: Test connection
Write-Host "`nTesting database connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $plainPassword

try {
    $testResult = & psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
        
        # Check if database exists
        $dbExists = & psql -h localhost -p 5432 -U postgres -lqt 2>&1 | Select-String "aadhaar_db"
        
        if (-not $dbExists) {
            Write-Host "`nCreating database 'aadhaar_db'..." -ForegroundColor Yellow
            & createdb -h localhost -p 5432 -U postgres aadhaar_db 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database created!" -ForegroundColor Green
            }
        }
        
        # Step 4: Add test data using the script
        Write-Host "`nAdding test data..." -ForegroundColor Yellow
        Write-Host "Running: npm run add-test-data`n" -ForegroundColor Gray
        
        npm run add-test-data
        
        Write-Host "`n✅ Done! Test data should be added." -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "1. Start server: npm run dev" -ForegroundColor White
        Write-Host "2. Visit: http://localhost:3000" -ForegroundColor White
        Write-Host "3. Search for Aadhaar: 123456789012" -ForegroundColor White
        
    } else {
        Write-Host "❌ Database connection failed!" -ForegroundColor Red
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "- PostgreSQL is running" -ForegroundColor White
        Write-Host "- Password is correct" -ForegroundColor White
        Write-Host "- Database user exists" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""

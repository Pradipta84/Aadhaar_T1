# Interactive Database Setup Wizard
# This script helps you configure your database connection step by step

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Database Setup Wizard" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check if PostgreSQL is running
Write-Host "Step 1: Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($pgService) {
    if ($pgService.Status -eq 'Running') {
        Write-Host "  ✅ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  PostgreSQL service found but not running" -ForegroundColor Yellow
        $start = Read-Host "  Start PostgreSQL service? (y/n)"
        if ($start -eq 'y' -or $start -eq 'Y') {
            Start-Service $pgService.Name
            Write-Host "  ✅ PostgreSQL service started" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ⚠️  PostgreSQL service not found" -ForegroundColor Yellow
    Write-Host "  Please make sure PostgreSQL is installed" -ForegroundColor Red
}

# Step 2: Test connection with different methods
Write-Host "`nStep 2: Testing database connection..." -ForegroundColor Yellow

$hostName = Read-Host "Enter database host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($hostName)) { $hostName = "localhost" }

$port = Read-Host "Enter database port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($port)) { $port = "5432" }

$dbName = Read-Host "Enter database name (default: aadhaar_db)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "aadhaar_db" }

$dbUser = Read-Host "Enter database user (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

# Step 3: Try to find the password
Write-Host "`nStep 3: Testing password..." -ForegroundColor Yellow
Write-Host "  We'll try a few common passwords, or you can enter your own.`n" -ForegroundColor Gray

$commonPasswords = @("postgres", "admin", "password", "root", "123456", "")

$passwordFound = $false
$correctPassword = ""

foreach ($testPass in $commonPasswords) {
    Write-Host "  Trying: $($testPass -eq '' ? '(empty)' : '***')..." -ForegroundColor Gray -NoNewline
    
    try {
        $env:PGPASSWORD = $testPass
        $result = & psql -h $hostName -p $port -U $dbUser -d $dbName -c "SELECT 1;" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅ SUCCESS!" -ForegroundColor Green
            $passwordFound = $true
            $correctPassword = $testPass
            break
        } else {
            Write-Host " ❌ Failed" -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ Failed" -ForegroundColor Red
    }
}

if (-not $passwordFound) {
    Write-Host "`n  Common passwords didn't work. Please enter your password:" -ForegroundColor Yellow
    $correctPassword = Read-Host "  Password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($correctPassword)
    $correctPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Step 4: Create/Update .env file
Write-Host "`nStep 4: Updating .env file..." -ForegroundColor Yellow

$envContent = @"
# PostgreSQL Database Configuration
DB_HOST=$hostName
DB_PORT=$port
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$correctPassword

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
Write-Host "  ✅ .env file updated!" -ForegroundColor Green

# Step 5: Test the connection
Write-Host "`nStep 5: Verifying connection..." -ForegroundColor Yellow

try {
    $env:PGPASSWORD = $correctPassword
    $testResult = & psql -h $hostName -p $port -U $dbUser -d $dbName -c "SELECT version();" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Connection verified!" -ForegroundColor Green
        
        # Check if database exists, if not create it
        $dbExists = & psql -h $hostName -p $port -U $dbUser -lqt 2>&1 | Select-String $dbName
        
        if (-not $dbExists) {
            Write-Host "`n  Database '$dbName' doesn't exist. Creating it..." -ForegroundColor Yellow
            & createdb -h $hostName -p $port -U $dbUser $dbName 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Database created!" -ForegroundColor Green
            }
        }
        
        Write-Host "`n✅ Setup complete! Your database is ready." -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "  1. Restart your Next.js server: npm run dev" -ForegroundColor White
        Write-Host "  2. Initialize database: Visit http://localhost:3000/api/init-db" -ForegroundColor White
        Write-Host "  3. Add test data: Visit http://localhost:3000/api/test-data (POST)" -ForegroundColor White
    } else {
        Write-Host "  ❌ Connection test failed" -ForegroundColor Red
        Write-Host "  Please check your credentials manually" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n"

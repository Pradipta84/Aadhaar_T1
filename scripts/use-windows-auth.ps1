# Alternative: Use Windows Authentication (if PostgreSQL is configured for it)
# This uses your Windows login instead of a password

Write-Host "`n=== Windows Authentication Method ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "This method uses Windows Authentication instead of a password.`n" -ForegroundColor Yellow
Write-Host "Note: This requires PostgreSQL to be configured for Windows Authentication.`n" -ForegroundColor Gray

$useWindowsAuth = Read-Host "Do you want to use Windows Authentication? (y/n)"

if ($useWindowsAuth -ne 'y' -and $useWindowsAuth -ne 'Y') {
    Write-Host "Skipping Windows Authentication setup." -ForegroundColor Yellow
    exit
}

# Get current Windows user
$windowsUser = $env:USERNAME
Write-Host "`nUsing Windows user: $windowsUser" -ForegroundColor Green

# Update .env to use Windows authentication
# PostgreSQL with Windows auth typically uses 'trust' or 'ident' method
# We'll set password to empty and let PostgreSQL handle it

$hostName = Read-Host "Enter database host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($hostName)) { $hostName = "localhost" }

$port = Read-Host "Enter database port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($port)) { $port = "5432" }

$dbName = Read-Host "Enter database name (default: aadhaar_db)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "aadhaar_db" }

$dbUser = Read-Host "Enter database user (default: $windowsUser)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = $windowsUser }

# For Windows auth, password might be empty or the Windows password
Write-Host "`nFor Windows Authentication, password is usually empty or your Windows password." -ForegroundColor Yellow
$password = Read-Host "Enter password (or leave empty for Windows auth)"

$envContent = @"
# PostgreSQL Database Configuration (Windows Authentication)
DB_HOST=$hostName
DB_PORT=$port
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$password

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
Write-Host "`n✅ .env file updated for Windows Authentication!" -ForegroundColor Green
Write-Host "`nNote: Make sure pg_hba.conf is configured for Windows Authentication.`n" -ForegroundColor Yellow

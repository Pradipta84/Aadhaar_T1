# Script to help find your PostgreSQL password
# Tests common passwords and connection methods

Write-Host "`n=== PostgreSQL Password Finder ===" -ForegroundColor Cyan
Write-Host ""

$hostName = Read-Host "Enter host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($hostName)) { $hostName = "localhost" }

$port = Read-Host "Enter port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($port)) { $port = "5432" }

$dbUser = Read-Host "Enter username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

Write-Host "`nTesting common passwords...`n" -ForegroundColor Yellow

$commonPasswords = @(
    "postgres",
    "admin", 
    "password",
    "root",
    "123456",
    "postgres123",
    "admin123",
    "",
    "changeme"
)

$found = $false

foreach ($pwd in $commonPasswords) {
    $displayPwd = if ($pwd -eq "") { "(empty)" } else { "***" }
    Write-Host "Trying password: $displayPwd ... " -NoNewline -ForegroundColor Gray
    
    try {
        $env:PGPASSWORD = $pwd
        $null = & psql -h $hostName -p $port -U $dbUser -d postgres -c "SELECT 1;" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SUCCESS!" -ForegroundColor Green
            Write-Host "`nFound password: $($pwd -eq '' ? '(empty)' : '***')" -ForegroundColor Green
            
            # Update .env file
            if (Test-Path ".env") {
                $envContent = Get-Content .env
                $updated = $envContent | ForEach-Object {
                    if ($_ -match "^DB_PASSWORD=") {
                        "DB_PASSWORD=$pwd"
                    } else {
                        $_
                    }
                }
                $updated | Set-Content .env -Encoding UTF8
                Write-Host "✅ Updated .env file with the correct password!" -ForegroundColor Green
            }
            
            $found = $true
            break
        } else {
            Write-Host "❌" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌" -ForegroundColor Red
    }
}

if (-not $found) {
    Write-Host "`n❌ None of the common passwords worked." -ForegroundColor Red
    Write-Host "`nYou can:" -ForegroundColor Yellow
    Write-Host "1. Reset your PostgreSQL password using pgAdmin" -ForegroundColor White
    Write-Host "2. Or manually enter it when prompted" -ForegroundColor White
    Write-Host "3. Or use the setup wizard: .\scripts\setup-database.ps1`n" -ForegroundColor White
}

Write-Host ""

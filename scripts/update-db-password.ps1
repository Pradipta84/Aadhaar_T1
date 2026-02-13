# PowerShell script to help update database password in .env file

Write-Host "`n=== Update Database Password ===" -ForegroundColor Yellow
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}

# Read current .env
$envContent = Get-Content .env

Write-Host "Current database configuration:" -ForegroundColor Cyan
$envContent | Where-Object { $_ -match "^DB_" } | ForEach-Object {
    if ($_ -match "PASSWORD") {
        Write-Host "  $_" -ForegroundColor Gray
    } else {
        Write-Host "  $_" -ForegroundColor White
    }
}

Write-Host "`nEnter your PostgreSQL password (or press Enter to keep current):" -ForegroundColor Yellow
$newPassword = Read-Host "Password"

if ([string]::IsNullOrWhiteSpace($newPassword)) {
    Write-Host "`nNo password entered. Keeping current password." -ForegroundColor Yellow
    exit 0
}

# Update .env file
$updatedContent = $envContent | ForEach-Object {
    if ($_ -match "^DB_PASSWORD=") {
        "DB_PASSWORD=$newPassword"
    } else {
        $_
    }
}

$updatedContent | Set-Content .env -Encoding UTF8

Write-Host "`n✅ Password updated in .env file!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Restart your Next.js server (if running)" -ForegroundColor White
Write-Host "2. Test connection: npm run test-db" -ForegroundColor White
Write-Host ""

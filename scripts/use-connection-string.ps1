# Alternative: Use PostgreSQL Connection String
# This allows you to use a full connection string instead of individual variables

Write-Host "`n=== Using Connection String Method ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Instead of individual DB_* variables, you can use a connection string.`n" -ForegroundColor Yellow

Write-Host "Enter your PostgreSQL connection string:" -ForegroundColor White
Write-Host "Format: postgresql://username:password@host:port/database" -ForegroundColor Gray
Write-Host "Example: postgresql://postgres:mypassword@localhost:5432/aadhaar_db`n" -ForegroundColor Gray

$connectionString = Read-Host "Connection String"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "No connection string provided. Exiting." -ForegroundColor Red
    exit
}

# Parse connection string
if ($connectionString -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $user = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "`nParsed connection details:" -ForegroundColor Green
    Write-Host "  Host: $host" -ForegroundColor White
    Write-Host "  Port: $port" -ForegroundColor White
    Write-Host "  Database: $database" -ForegroundColor White
    Write-Host "  User: $user" -ForegroundColor White
    Write-Host "  Password: ***`n" -ForegroundColor White
    
    # Update .env file
    $envContent = @"
# PostgreSQL Database Configuration
DB_HOST=$host
DB_PORT=$port
DB_NAME=$database
DB_USER=$user
DB_PASSWORD=$password

# Alternative: Use connection string (uncomment to use)
# DATABASE_URL=$connectionString

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
    Write-Host "✅ .env file updated with connection string details!" -ForegroundColor Green
    
} else {
    Write-Host "❌ Invalid connection string format!" -ForegroundColor Red
    Write-Host "Expected format: postgresql://user:password@host:port/database" -ForegroundColor Yellow
}

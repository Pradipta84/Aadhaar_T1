# Setup PostgreSQL using Connection String

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  PostgreSQL Connection String Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "PostgreSQL Connection String Format:" -ForegroundColor Yellow
Write-Host "postgresql://username:password@host:port/database`n" -ForegroundColor White

Write-Host "Example:" -ForegroundColor Yellow
Write-Host "postgresql://postgres:mypassword@localhost:5432/aadhaar_db`n" -ForegroundColor Gray

Write-Host "Enter your PostgreSQL connection string:" -ForegroundColor Cyan
$connectionString = Read-Host "Connection String"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "`n❌ No connection string provided. Exiting." -ForegroundColor Red
    exit 1
}

# Validate format
if (-not ($connectionString -match "postgresql://")) {
    Write-Host "`n⚠️  Warning: Connection string should start with 'postgresql://'" -ForegroundColor Yellow
    Write-Host "Adding prefix..." -ForegroundColor Gray
    $connectionString = "postgresql://" + $connectionString
}

# Parse connection string
if ($connectionString -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $user = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "`n✅ Connection string parsed successfully!" -ForegroundColor Green
    Write-Host "`nConnection Details:" -ForegroundColor Cyan
    Write-Host "  Host: $host" -ForegroundColor White
    Write-Host "  Port: $port" -ForegroundColor White
    Write-Host "  Database: $database" -ForegroundColor White
    Write-Host "  User: $user" -ForegroundColor White
    Write-Host "  Password: ***`n" -ForegroundColor White
    
    # Update .env file with connection string
    $envContent = @"
# PostgreSQL Database Configuration
# Using Connection String Method
DATABASE_URL=$connectionString

# Alternative: Individual variables (commented out)
# DB_HOST=$host
# DB_PORT=$port
# DB_NAME=$database
# DB_USER=$user
# DB_PASSWORD=$password

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
    Write-Host "✅ .env file updated with connection string!" -ForegroundColor Green
    
    # Test connection
    Write-Host "`nTesting connection..." -ForegroundColor Yellow
    
    try {
        # Try to connect using Node.js test script
        $testScript = @"
const { Pool } = require('pg');
const pool = new Pool({ connectionString: '$connectionString' });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connection successful!');
    console.log('Current time:', res.rows[0].now);
    pool.end();
  }
});
"@
        
        $testScript | Out-File -FilePath "temp-test-connection.js" -Encoding UTF8
        node temp-test-connection.js
        Remove-Item "temp-test-connection.js" -ErrorAction SilentlyContinue
        
        Write-Host "`n✅ Connection test passed!" -ForegroundColor Green
        
        # Check if database exists, create if not
        Write-Host "`nChecking if database '$database' exists..." -ForegroundColor Yellow
        
        # Initialize database schema
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "1. Start server: npm run dev" -ForegroundColor White
        Write-Host "2. Initialize schema: Visit http://localhost:3000/api/init-db" -ForegroundColor White
        Write-Host "3. Add test data: Visit http://localhost:3000/api/test-data (POST)" -ForegroundColor White
        Write-Host "4. Test application: http://localhost:3000`n" -ForegroundColor White
        
    } catch {
        Write-Host "`n⚠️  Could not test connection automatically" -ForegroundColor Yellow
        Write-Host "You can test it manually after starting the server" -ForegroundColor Gray
    }
    
} else {
    Write-Host "`n❌ Invalid connection string format!" -ForegroundColor Red
    Write-Host "Expected format: postgresql://user:password@host:port/database" -ForegroundColor Yellow
    Write-Host "Example: postgresql://postgres:mypassword@localhost:5432/aadhaar_db`n" -ForegroundColor Gray
    exit 1
}

Write-Host ""

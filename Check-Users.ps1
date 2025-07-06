# VoiceVault User Management Tool
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "VoiceVault User Management Tool" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if PostgreSQL is running
function Test-PostgreSQL {
    try {
        $result = Test-NetConnection -ComputerName "localhost" -Port 5432 -InformationLevel Quiet
        return $result
    } catch {
        return $false
    }
}

# Function to start PostgreSQL service if it's installed
function Start-PostgreSQLService {
    Write-Host "Attempting to start PostgreSQL service..." -ForegroundColor Yellow
    
    # Try different service names
    $serviceNames = @("postgresql-x64-16", "postgresql-x64-15", "postgresql-x64-14", "postgresql", "PostgreSQL")
    
    foreach ($serviceName in $serviceNames) {
        try {
            $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
            if ($service) {
                Write-Host "Found PostgreSQL service: $serviceName" -ForegroundColor Green
                if ($service.Status -ne "Running") {
                    Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
                    Start-Service -Name $serviceName
                    Start-Sleep -Seconds 5
                    Write-Host "PostgreSQL service started successfully!" -ForegroundColor Green
                } else {
                    Write-Host "PostgreSQL service is already running!" -ForegroundColor Green
                }
                return $true
            }
        } catch {
            continue
        }
    }
    
    Write-Host "No PostgreSQL service found. Please ensure PostgreSQL is installed." -ForegroundColor Red
    return $false
}

# Function to start Docker PostgreSQL
function Start-DockerPostgreSQL {
    Write-Host "Attempting to start PostgreSQL via Docker..." -ForegroundColor Yellow
    
    try {
        # Check if Docker is available
        docker --version | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Docker is not available." -ForegroundColor Red
            return $false
        }
        
        # Try to start PostgreSQL container
        Set-Location -Path "."
        docker-compose up -d postgres
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Docker PostgreSQL started successfully!" -ForegroundColor Green
            Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
            return $true
        } else {
            Write-Host "Failed to start Docker PostgreSQL." -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "Error starting Docker PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "Step 1: Checking PostgreSQL availability..." -ForegroundColor Yellow

$postgresAvailable = Test-PostgreSQL

if (-not $postgresAvailable) {
    Write-Host "PostgreSQL is not running. Attempting to start it..." -ForegroundColor Yellow
    
    # Try to start PostgreSQL service first
    $serviceStarted = Start-PostgreSQLService
    
    if (-not $serviceStarted) {
        # Try Docker as fallback
        $dockerStarted = Start-DockerPostgreSQL
        
        if (-not $dockerStarted) {
            Write-Host ""
            Write-Host "Unable to start PostgreSQL. Please:" -ForegroundColor Red
            Write-Host "1. Install PostgreSQL locally, or" -ForegroundColor Red
            Write-Host "2. Ensure Docker is running and try again, or" -ForegroundColor Red
            Write-Host "3. Start PostgreSQL manually" -ForegroundColor Red
            Write-Host ""
            Write-Host "Press any key to exit..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 1
        }
    }
    
    # Re-check PostgreSQL availability
    Start-Sleep -Seconds 3
    $postgresAvailable = Test-PostgreSQL
}

if ($postgresAvailable) {
    Write-Host "✅ PostgreSQL is available!" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL is still not available." -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Installing required dependencies..." -ForegroundColor Yellow
Set-Location -Path "server"
& pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies." -ForegroundColor Red
    Set-Location -Path ".."
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host ""

# Step 3: Check database connection and setup
Write-Host "Step 3: Checking database connection and setup..." -ForegroundColor Yellow
& pnpm exec ts-node scripts/check-database.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Database setup failed. Please check the error messages above." -ForegroundColor Red
    Set-Location -Path ".."
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host ""

# Step 4: List existing users
Write-Host "Step 4: Listing existing users..." -ForegroundColor Yellow
& pnpm exec ts-node scripts/listUsers.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Failed to list users. Please check the error messages above." -ForegroundColor Red
    Set-Location -Path ".."
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Set-Location -Path ".."
Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "User check completed!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Ask if user wants to create admin user
Write-Host "Would you like to create/update the admin user? (y/n): " -ForegroundColor Cyan -NoNewline
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y" -or $response -eq "yes" -or $response -eq "Yes") {
    Write-Host ""
    Write-Host "Creating/updating admin user..." -ForegroundColor Yellow
    Set-Location -Path "server"
    & pnpm exec ts-node scripts/createAdminTester.ts
    Set-Location -Path ".."
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Admin user created/updated successfully!" -ForegroundColor Green
        Write-Host "You can now log in with:" -ForegroundColor Cyan
        Write-Host "Email: Admin@godesk.io" -ForegroundColor White
        Write-Host "Password: K24a4_rb26" -ForegroundColor White
    } else {
        Write-Host "Failed to create/update admin user." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
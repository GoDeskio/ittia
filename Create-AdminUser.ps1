# VoiceVault Admin User Creation Tool
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "VoiceVault Admin User Creation Tool" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "Step 1: Installing required dependencies..." -ForegroundColor Yellow
Set-Location -Path "server"
& pnpm install
Write-Host ""

# Step 2: Check database connection
Write-Host "Step 2: Checking database connection..." -ForegroundColor Yellow
& pnpm exec ts-node scripts/check-database.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Database check failed. Please fix the issues and try again." -ForegroundColor Red
    Set-Location -Path ".."
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host ""

# Step 3: Create admin user
Write-Host "Step 3: Creating Admin Tester account..." -ForegroundColor Yellow
& pnpm run create:admin
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Failed to create admin user. Please check the error messages above." -ForegroundColor Red
    Set-Location -Path ".."
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Set-Location -Path ".."
Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "Admin user creation completed!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now log in with:" -ForegroundColor Cyan
Write-Host "Email: Admin@godesk.io" -ForegroundColor White
Write-Host "Password: K24a4_rb26" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
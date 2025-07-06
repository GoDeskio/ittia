Write-Host "Creating Admin Tester account..." -ForegroundColor Cyan
Set-Location -Path (Split-Path -Parent $PSScriptRoot)
npx ts-node scripts/createAdminTester.ts
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
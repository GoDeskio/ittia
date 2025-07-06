# VoiceVault Test Environment Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎯 VoiceVault Test Environment Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check if pnpm is installed
Write-Host "📦 Checking pnpm installation..." -ForegroundColor Blue
if (-not (Test-Command "pnpm")) {
    Write-Host "❌ pnpm is not installed. Please install pnpm manually:" -ForegroundColor Red
    Write-Host "   Visit: https://pnpm.io/installation" -ForegroundColor Yellow
    Write-Host "   Or use: corepack enable pnpm" -ForegroundColor Yellow
    Write-Host "   Or use: npm install -g pnpm (if you have npm)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
else {
    Write-Host "✅ pnpm is available" -ForegroundColor Green
}

Write-Host ""

# Install dependencies
Write-Host "🔧 Installing root dependencies..." -ForegroundColor Blue
try {
    pnpm install
    Write-Host "✅ Root dependencies installed" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🔧 Installing server dependencies..." -ForegroundColor Blue
try {
    Set-Location server
    pnpm install
    Set-Location ..
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🔧 Installing client dependencies..." -ForegroundColor Blue
try {
    Set-Location client
    pnpm install
    Set-Location ..
    Write-Host "✅ Client dependencies installed" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install client dependencies" -ForegroundColor Red
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Check Bit components
Write-Host "🎯 Bit Components Status:" -ForegroundColor Blue
try {
    pnpm run bit:status
}
catch {
    Write-Host "⚠️ Bit status check failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Build Bit components
Write-Host "🔨 Building Bit components..." -ForegroundColor Blue
try {
    pnpm run bit:compile
    Write-Host "✅ Bit components compiled" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Bit compilation failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Test Environment Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Menu
do {
    Write-Host "Choose an option:" -ForegroundColor Yellow
    Write-Host "1. Start Bit development server (recommended for component testing)" -ForegroundColor White
    Write-Host "2. Start full application (client + server)" -ForegroundColor White
    Write-Host "3. Start client only" -ForegroundColor White
    Write-Host "4. Start server only" -ForegroundColor White
    Write-Host "5. Run tests" -ForegroundColor White
    Write-Host "6. Open test HTML file" -ForegroundColor White
    Write-Host "7. Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-7)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "🎯 Starting Bit development server..." -ForegroundColor Green
            Write-Host "This will open a browser with your components" -ForegroundColor Yellow
            Write-Host ""
            pnpm run bit:start
            break
        }
        "2" {
            Write-Host ""
            Write-Host "🚀 Starting full application..." -ForegroundColor Green
            Write-Host "Client will be available at: http://localhost:3000" -ForegroundColor Yellow
            Write-Host "Server will be available at: http://localhost:4000" -ForegroundColor Yellow
            Write-Host ""
            pnpm run dev
            break
        }
        "3" {
            Write-Host ""
            Write-Host "🖥️ Starting client only..." -ForegroundColor Green
            Write-Host "Available at: http://localhost:3000" -ForegroundColor Yellow
            Write-Host ""
            pnpm run dev:client
            break
        }
        "4" {
            Write-Host ""
            Write-Host "🖥️ Starting server only..." -ForegroundColor Green
            Write-Host "Available at: http://localhost:4000" -ForegroundColor Yellow
            Write-Host ""
            pnpm run dev:server
            break
        }
        "5" {
            Write-Host ""
            Write-Host "🧪 Running tests..." -ForegroundColor Green
            Write-Host ""
            pnpm run test
            Read-Host "Press Enter to continue"
        }
        "6" {
            Write-Host ""
            Write-Host "🌐 Opening test HTML file..." -ForegroundColor Green
            Start-Process "test.html"
            Write-Host "Test file opened in your default browser" -ForegroundColor Yellow
            Read-Host "Press Enter to continue"
        }
        "7" {
            Write-Host ""
            Write-Host "Goodbye!" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host ""
            Write-Host "❌ Invalid choice. Please enter a number between 1-7." -ForegroundColor Red
            Write-Host ""
        }
    }
} while ($choice -ne "7")

Read-Host "Press Enter to exit"
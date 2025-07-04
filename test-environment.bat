@echo off
echo ========================================
echo 🎯 VoiceVault Test Environment Setup
echo ========================================
echo.

echo 📦 Installing dependencies with pnpm...
echo.

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Please install pnpm manually:
    echo    Visit: https://pnpm.io/installation
    echo    Or use: corepack enable pnpm
    echo    Or use: npm install -g pnpm (if you have npm)
    pause
    exit /b 1
)

echo ✅ pnpm is available
echo.

echo 🔧 Installing root dependencies...
pnpm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

echo 🔧 Installing server dependencies...
cd server
pnpm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo 🔧 Installing client dependencies...
cd client
pnpm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ All dependencies installed successfully!
echo.

echo 🎯 Bit Components Status:
pnpm run bit:status
echo.

echo 🔨 Building Bit components...
pnpm run bit:compile
echo.

echo ========================================
echo 🚀 Test Environment Ready!
echo ========================================
echo.
echo Choose an option:
echo 1. Start Bit development server (recommended for component testing)
echo 2. Start full application (client + server)
echo 3. Start client only
echo 4. Start server only
echo 5. Run tests
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🎯 Starting Bit development server...
    echo This will open a browser with your components
    echo.
    pnpm run bit:start
) else if "%choice%"=="2" (
    echo.
    echo 🚀 Starting full application...
    echo Client will be available at: http://localhost:3000
    echo Server will be available at: http://localhost:4000
    echo.
    pnpm run dev
) else if "%choice%"=="3" (
    echo.
    echo 🖥️ Starting client only...
    echo Available at: http://localhost:3000
    echo.
    pnpm run dev:client
) else if "%choice%"=="4" (
    echo.
    echo 🖥️ Starting server only...
    echo Available at: http://localhost:4000
    echo.
    pnpm run dev:server
) else if "%choice%"=="5" (
    echo.
    echo 🧪 Running tests...
    echo.
    pnpm run test
) else if "%choice%"=="6" (
    echo.
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo.
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

pause
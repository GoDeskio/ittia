@echo off
echo ========================================
echo VoiceVault Test Environment
echo ========================================
echo.

echo Checking pnpm...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: pnpm is not installed
    echo Please install pnpm first: npm install -g pnpm
    pause
    exit /b 1
)

echo pnpm is available
echo.

echo Installing dependencies...
pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.

echo Choose what to run:
echo 1. Start full application (client + server)
echo 2. Start client only
echo 3. Start server only
echo 4. Open test HTML file
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting full application...
    echo Client: http://localhost:3000
    echo Server: http://localhost:4000
    echo.
    pnpm run dev
) else if "%choice%"=="2" (
    echo.
    echo Starting client only...
    echo Available at: http://localhost:3000
    echo.
    cd client
    pnpm run dev
) else if "%choice%"=="3" (
    echo.
    echo Starting server only...
    echo Available at: http://localhost:4000
    echo.
    cd server
    pnpm run dev
) else if "%choice%"=="4" (
    echo.
    echo Opening test HTML file...
    start test.html
    echo Test file opened in browser
    pause
) else if "%choice%"=="5" (
    echo.
    echo Goodbye!
    exit /b 0
) else (
    echo.
    echo Invalid choice. Please try again.
    pause
    goto :eof
)

pause
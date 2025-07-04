@echo off
echo ========================================
echo VoiceVault Quick Start (No TensorFlow)
echo ========================================
echo.

echo This script will start the client without TensorFlow dependencies
echo to avoid Python compilation issues.
echo.

echo Step 1: Installing client dependencies only...
cd client
pnpm install --ignore-scripts
if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Starting React development server...
echo Client will be available at: http://localhost:3000
echo.

pnpm run dev

pause
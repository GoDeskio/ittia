@echo off
echo ========================================
echo Starting VoiceVault Development Environment
echo ========================================
echo.

echo Starting client development server...
start "VoiceVault Client" cmd /k "cd /d client && pnpm run dev"

echo.
echo Waiting 5 seconds before starting server...
timeout /t 5 /nobreak >nul

echo Starting server development server...
start "VoiceVault Server" cmd /k "cd /d server && pnpm run dev"

echo.
echo ========================================
echo Development servers are starting...
echo ========================================
echo.
echo Client: http://localhost:3000
echo Server: http://localhost:4000
echo.
echo Press any key to close this window...
pause >nul
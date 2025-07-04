@echo off
REM VoiceVault Desktop Application Launcher
REM This script automatically chooses the best method to run the application

echo ========================================
echo 🚀 VoiceVault Desktop Application Launcher
echo ========================================
echo.

REM Check if PowerShell is available and execution policy allows scripts
powershell -Command "Get-ExecutionPolicy" >nul 2>&1
if %errorlevel%==0 (
    REM Check execution policy
    for /f "tokens=*" %%i in ('powershell -Command "Get-ExecutionPolicy"') do set EXEC_POLICY=%%i
    
    if /i "!EXEC_POLICY!"=="Restricted" (
        echo 📝 PowerShell execution policy is restricted
        echo 🔄 Using batch file method...
        echo.
        call "%~dp0run-desktop-app.bat" %*
    ) else (
        echo 🔄 Using PowerShell method (recommended)...
        echo.
        powershell -ExecutionPolicy Bypass -File "%~dp0run-desktop-app.ps1" %*
    )
) else (
    echo 🔄 Using batch file method...
    echo.
    call "%~dp0run-desktop-app.bat" %*
)

echo.
echo 👋 Thanks for using VoiceVault!
pause
@echo off
setlocal enabledelayedexpansion

REM VoiceVault Desktop Application Runner (Batch Version)
REM This script downloads, installs, and runs everything needed for the desktop application

echo ========================================
echo 🚀 VoiceVault Desktop Application Runner
echo ========================================
echo.

REM Configuration
set PROJECT_ROOT=%~dp0
set NODE_MIN_VERSION=18.0.0
set PNPM_MIN_VERSION=8.0.0
set CLIENT_PORT=3000
set SERVER_PORT=4000

REM Parse command line arguments
set SKIP_INSTALL=0
set PRODUCTION_BUILD=0
set CLEAN_INSTALL=0
set SHOW_HELP=0

:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="--skip-install" set SKIP_INSTALL=1
if /i "%~1"=="-s" set SKIP_INSTALL=1
if /i "%~1"=="--production" set PRODUCTION_BUILD=1
if /i "%~1"=="-p" set PRODUCTION_BUILD=1
if /i "%~1"=="--clean" set CLEAN_INSTALL=1
if /i "%~1"=="-c" set CLEAN_INSTALL=1
if /i "%~1"=="--help" set SHOW_HELP=1
if /i "%~1"=="-h" set SHOW_HELP=1
shift
goto :parse_args

:args_done

if %SHOW_HELP%==1 goto :show_help

echo 📍 Project Root: %PROJECT_ROOT%
if %PRODUCTION_BUILD%==1 (
    echo 🎯 Mode: Production
) else (
    echo 🎯 Mode: Development
)
echo.

REM Function to check if command exists
:check_command
where %1 >nul 2>&1
exit /b %errorlevel%

REM Check Node.js
echo 🔍 Checking Node.js...
call :check_command node
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    goto :install_nodejs
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
    set NODE_VERSION=!NODE_VERSION:v=!
    echo ✅ Node.js version: !NODE_VERSION!
)

REM Check pnpm
echo 🔍 Checking pnpm...
call :check_command pnpm
if %errorlevel% neq 0 (
    echo ❌ pnpm not found
    goto :install_pnpm
) else (
    for /f "tokens=*" %%i in ('pnpm --version 2^>nul') do set PNPM_VERSION=%%i
    echo ✅ pnpm version: !PNPM_VERSION!
)

goto :main_execution

:install_nodejs
echo.
echo 📦 Node.js installation required
echo Please install Node.js manually from: https://nodejs.org/
echo Minimum version required: %NODE_MIN_VERSION%
echo.
echo After installation, restart this script.
pause
exit /b 1

:install_pnpm
echo.
echo 📦 Installing pnpm...
call :check_command npm
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install Node.js first.
    goto :install_nodejs
)

echo Installing pnpm via npm...
npm install -g pnpm
if %errorlevel% neq 0 (
    echo ❌ Failed to install pnpm
    echo Please install pnpm manually: https://pnpm.io/installation
    pause
    exit /b 1
)

echo ✅ pnpm installed successfully!
for /f "tokens=*" %%i in ('pnpm --version 2^>nul') do set PNPM_VERSION=%%i
echo pnpm version: !PNPM_VERSION!
goto :main_execution

:main_execution
echo.

REM Clean installation if requested
if %CLEAN_INSTALL%==1 (
    echo 🧹 Cleaning previous installations...
    if exist "%PROJECT_ROOT%node_modules" rmdir /s /q "%PROJECT_ROOT%node_modules" 2>nul
    if exist "%PROJECT_ROOT%client\node_modules" rmdir /s /q "%PROJECT_ROOT%client\node_modules" 2>nul
    if exist "%PROJECT_ROOT%server\node_modules" rmdir /s /q "%PROJECT_ROOT%server\node_modules" 2>nul
    if exist "%PROJECT_ROOT%shared\node_modules" rmdir /s /q "%PROJECT_ROOT%shared\node_modules" 2>nul
    if exist "%PROJECT_ROOT%client\build" rmdir /s /q "%PROJECT_ROOT%client\build" 2>nul
    if exist "%PROJECT_ROOT%server\dist" rmdir /s /q "%PROJECT_ROOT%server\dist" 2>nul
    echo ✅ Cleanup completed
    echo.
)

REM Install dependencies unless skipped
if %SKIP_INSTALL%==0 (
    echo 📦 Installing dependencies...
    echo.
    
    echo Installing root dependencies...
    cd /d "%PROJECT_ROOT%"
    pnpm install
    if %errorlevel% neq 0 (
        echo ❌ Root dependency installation failed
        pause
        exit /b 1
    )
    
    echo Installing server dependencies...
    cd /d "%PROJECT_ROOT%server"
    pnpm install
    if %errorlevel% neq 0 (
        echo ❌ Server dependency installation failed
        pause
        exit /b 1
    )
    
    echo Installing client dependencies...
    cd /d "%PROJECT_ROOT%client"
    pnpm install
    if %errorlevel% neq 0 (
        echo ❌ Client dependency installation failed
        pause
        exit /b 1
    )
    
    cd /d "%PROJECT_ROOT%"
    echo ✅ All dependencies installed successfully!
    echo.
)

REM Build and run application
if %PRODUCTION_BUILD%==1 (
    echo 🔨 Building for production...
    cd /d "%PROJECT_ROOT%"
    pnpm run build
    if %errorlevel% neq 0 (
        echo ❌ Production build failed
        pause
        exit /b 1
    )
    echo ✅ Production build completed!
    echo.
    
    echo 🚀 Starting production server...
    echo 🌐 Application will be available at: http://localhost:%SERVER_PORT%
    echo Press Ctrl+C to stop the server
    echo.
    pnpm start
) else (
    echo 🚀 Starting development servers...
    echo 🌐 Application will be available at:
    echo    Client: http://localhost:%CLIENT_PORT%
    echo    Server: http://localhost:%SERVER_PORT%
    echo.
    echo Press Ctrl+C to stop all servers
    echo.
    cd /d "%PROJECT_ROOT%"
    pnpm run dev
)

goto :end

:show_help
echo VoiceVault Desktop Application Runner
echo.
echo USAGE:
echo     run-desktop-app.bat [OPTIONS]
echo.
echo OPTIONS:
echo     --skip-install, -s    Skip dependency installation (faster if already installed)
echo     --production, -p      Build for production instead of development
echo     --clean, -c           Clean all node_modules and reinstall everything
echo     --help, -h            Show this help message
echo.
echo EXAMPLES:
echo     run-desktop-app.bat                    # Full setup and run in development mode
echo     run-desktop-app.bat --skip-install    # Skip installation, just run
echo     run-desktop-app.bat --production       # Build for production
echo     run-desktop-app.bat --clean           # Clean install everything
echo.
echo REQUIREMENTS:
echo     - Windows 10/11
echo     - Internet connection (for initial setup)
echo     - 4GB RAM minimum
echo     - 2GB free disk space
echo.
pause
exit /b 0

:end
echo.
echo Script execution completed.
pause
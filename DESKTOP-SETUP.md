# VoiceVault Desktop Application Setup

This guide will help you quickly set up and run the VoiceVault desktop application on Windows.

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)
Simply double-click `run-app.bat` and the script will handle everything automatically!

### Option 2: Manual Method Selection

#### PowerShell Method (Recommended)
```powershell
.\run-desktop-app.ps1
```

#### Batch File Method
```cmd
run-desktop-app.bat
```

## 📋 System Requirements

- **Operating System**: Windows 10/11
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free disk space
- **Internet**: Required for initial setup
- **Ports**: 3000 (client) and 4000 (server) should be available

## 🛠️ Command Line Options

### PowerShell Script Options
```powershell
# Basic usage
.\run-desktop-app.ps1

# Skip dependency installation (if already installed)
.\run-desktop-app.ps1 -SkipInstall

# Build for production
.\run-desktop-app.ps1 -ProductionBuild

# Clean install (removes all node_modules)
.\run-desktop-app.ps1 -CleanInstall

# Show help
.\run-desktop-app.ps1 -Help
```

### Batch Script Options
```cmd
# Basic usage
run-desktop-app.bat

# Skip dependency installation
run-desktop-app.bat --skip-install

# Build for production
run-desktop-app.bat --production

# Clean install
run-desktop-app.bat --clean

# Show help
run-desktop-app.bat --help
```

## 🔧 What the Scripts Do

### Automatic Installation
1. **Check Prerequisites**: Verifies Node.js and pnpm are installed
2. **Install Missing Tools**: Downloads and installs Node.js and pnpm if needed
3. **Install Dependencies**: Runs `pnpm install` for all workspace packages
4. **Build Application**: Compiles TypeScript and builds React app
5. **Start Servers**: Launches both client and server in development mode

### Development Mode (Default)
- Client runs on: `http://localhost:3000`
- Server runs on: `http://localhost:4000`
- Hot reload enabled for both client and server
- Automatic browser opening

### Production Mode
- Builds optimized production bundles
- Serves static files from server
- Single port deployment
- Optimized for performance

## 🌐 Accessing the Application

Once the script completes successfully:

1. **Client Interface**: Open `http://localhost:3000` in your browser
2. **Server API**: Available at `http://localhost:4000`
3. **API Documentation**: Visit `http://localhost:4000/api/docs` (if available)

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
If ports 3000 or 4000 are busy, the script will automatically find available ports and display them.

#### Node.js Installation Failed
- Download Node.js manually from: https://nodejs.org/
- Choose the LTS version (18.x or higher)
- Restart the script after installation

#### pnpm Installation Failed
- Run: `npm install -g pnpm`
- Or visit: https://pnpm.io/installation
- Restart the script after installation

#### Permission Errors
- Run Command Prompt or PowerShell as Administrator
- Or use the batch file version which has fewer permission requirements

#### Firewall Warnings
- Allow Node.js through Windows Firewall when prompted
- This is required for the development servers to work

### PowerShell Execution Policy Issues

If you get execution policy errors:

```powershell
# Check current policy
Get-ExecutionPolicy

# Allow scripts for current user (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass (one-time)
powershell -ExecutionPolicy Bypass -File .\run-desktop-app.ps1
```

### Clean Installation

If you encounter persistent issues:

```powershell
# PowerShell
.\run-desktop-app.ps1 -CleanInstall

# Batch
run-desktop-app.bat --clean
```

This will:
- Remove all `node_modules` folders
- Clear build outputs
- Reinstall everything from scratch

## 📁 Project Structure

```
voicevault/
├── client/                 # React frontend application
├── server/                 # Node.js backend server
├── shared/                 # Shared utilities and types
├── run-app.bat            # Smart launcher (chooses best method)
├── run-desktop-app.ps1    # PowerShell setup script
├── run-desktop-app.bat    # Batch setup script
└── DESKTOP-SETUP.md       # This file
```

## 🔄 Development Workflow

### First Time Setup
1. Run `run-app.bat` or `.\run-desktop-app.ps1`
2. Wait for installation and build to complete
3. Application opens automatically in browser

### Subsequent Runs
```powershell
# Skip installation for faster startup
.\run-desktop-app.ps1 -SkipInstall
```

### Making Changes
- Client code: Changes auto-reload in browser
- Server code: Server automatically restarts
- No need to restart the script

### Production Testing
```powershell
# Build and test production version
.\run-desktop-app.ps1 -ProductionBuild
```

## 🆘 Getting Help

### Script Help
```powershell
.\run-desktop-app.ps1 -Help
run-desktop-app.bat --help
```

### Manual Setup
If the automated scripts don't work, you can set up manually:

```cmd
# Install dependencies
pnpm install
cd server && pnpm install
cd ../client && pnpm install

# Start development servers
cd ..
pnpm run dev
```

### Support
- Check the main README.md for general project information
- Open an issue in the project repository
- Review the troubleshooting section above

## 🎯 Performance Tips

- **SSD Storage**: Install on SSD for faster dependency installation
- **Antivirus**: Add project folder to antivirus exclusions
- **RAM**: Close other applications if you have limited RAM
- **Network**: Use wired connection for faster downloads

## 🔐 Security Notes

- Scripts only download from official sources (nodejs.org, npmjs.com)
- No elevated privileges required for normal operation
- All dependencies are verified through pnpm lockfile
- Local development only - no external services required

---

**Happy coding! 🚀**
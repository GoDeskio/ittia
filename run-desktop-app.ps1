# VoiceVault Desktop Application Runner
# This script downloads, installs, and runs everything needed for the desktop application

param(
    [switch]$SkipInstall,
    [switch]$ProductionBuild,
    [switch]$CleanInstall,
    [switch]$Help
)

# Color functions for better output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Info { Write-ColorOutput Cyan $args }

# Help function
function Show-Help {
    Write-Host @"
VoiceVault Desktop Application Runner

USAGE:
    .\run-desktop-app.ps1 [OPTIONS]

OPTIONS:
    -SkipInstall      Skip dependency installation (faster if already installed)
    -ProductionBuild  Build for production instead of development
    -CleanInstall     Clean all node_modules and reinstall everything
    -Help             Show this help message

EXAMPLES:
    .\run-desktop-app.ps1                    # Full setup and run in development mode
    .\run-desktop-app.ps1 -SkipInstall       # Skip installation, just run
    .\run-desktop-app.ps1 -ProductionBuild   # Build for production
    .\run-desktop-app.ps1 -CleanInstall      # Clean install everything

REQUIREMENTS:
    - Windows 10/11
    - Internet connection (for initial setup)
    - 4GB RAM minimum
    - 2GB free disk space

"@
    exit 0
}

if ($Help) { Show-Help }

# Configuration
$PROJECT_ROOT = $PSScriptRoot
$NODE_MIN_VERSION = "18.0.0"
$PNPM_MIN_VERSION = "8.0.0"
$CLIENT_PORT = 3000
$SERVER_PORT = 4000

Write-Host @"
========================================
🚀 VoiceVault Desktop Application Runner
========================================
"@ -ForegroundColor Magenta

Write-Info "Project Root: $PROJECT_ROOT"
Write-Info "Mode: $(if ($ProductionBuild) { 'Production' } else { 'Development' })"

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to compare versions
function Compare-Version($version1, $version2) {
    $v1 = [System.Version]::Parse($version1)
    $v2 = [System.Version]::Parse($version2)
    return $v1.CompareTo($v2)
}

# Function to get Node.js version
function Get-NodeVersion {
    try {
        $nodeVersion = (node --version 2>$null) -replace 'v', ''
        return $nodeVersion
    } catch {
        return $null
    }
}

# Function to get pnpm version
function Get-PnpmVersion {
    try {
        $pnpmVersion = (pnpm --version 2>$null)
        return $pnpmVersion
    } catch {
        return $null
    }
}

# Function to install Node.js
function Install-NodeJS {
    Write-Info "📦 Installing Node.js..."
    
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
    
    try {
        Write-Info "Downloading Node.js installer..."
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
        
        Write-Info "Installing Node.js (this may take a few minutes)..."
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstaller, "/quiet", "/norestart" -Wait
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Remove-Item $nodeInstaller -Force -ErrorAction SilentlyContinue
        Write-Success "✅ Node.js installed successfully!"
        
        # Verify installation
        Start-Sleep -Seconds 2
        $nodeVersion = Get-NodeVersion
        if ($nodeVersion) {
            Write-Success "Node.js version: $nodeVersion"
        } else {
            Write-Warning "⚠️  Please restart your terminal and run this script again."
            exit 1
        }
    } catch {
        Write-Error "❌ Failed to install Node.js: $_"
        Write-Info "Please install Node.js manually from: https://nodejs.org/"
        exit 1
    }
}

# Function to install pnpm
function Install-Pnpm {
    Write-Info "📦 Installing pnpm..."
    
    try {
        # Try corepack first (recommended method)
        if (Test-Command "corepack") {
            Write-Info "Enabling pnpm via corepack..."
            corepack enable pnpm
            corepack prepare pnpm@latest --activate
        } else {
            # Fallback to npm installation
            Write-Info "Installing pnpm via npm..."
            npm install -g pnpm@latest
        }
        
        Write-Success "✅ pnpm installed successfully!"
        
        # Verify installation
        $pnpmVersion = Get-PnpmVersion
        if ($pnpmVersion) {
            Write-Success "pnpm version: $pnpmVersion"
        } else {
            Write-Error "❌ pnpm installation verification failed"
            exit 1
        }
    } catch {
        Write-Error "❌ Failed to install pnpm: $_"
        Write-Info "Please install pnpm manually: https://pnpm.io/installation"
        exit 1
    }
}

# Function to check and install prerequisites
function Install-Prerequisites {
    Write-Info "🔍 Checking prerequisites..."
    
    # Check Node.js
    $nodeVersion = Get-NodeVersion
    if (-not $nodeVersion) {
        Write-Warning "❌ Node.js not found"
        Install-NodeJS
    } elseif ((Compare-Version $nodeVersion $NODE_MIN_VERSION) -lt 0) {
        Write-Warning "❌ Node.js version $nodeVersion is too old (minimum: $NODE_MIN_VERSION)"
        Install-NodeJS
    } else {
        Write-Success "✅ Node.js version: $nodeVersion"
    }
    
    # Check pnpm
    $pnpmVersion = Get-PnpmVersion
    if (-not $pnpmVersion) {
        Write-Warning "❌ pnpm not found"
        Install-Pnpm
    } elseif ((Compare-Version $pnpmVersion $PNPM_MIN_VERSION) -lt 0) {
        Write-Warning "❌ pnpm version $pnpmVersion is too old (minimum: $PNPM_MIN_VERSION)"
        Install-Pnpm
    } else {
        Write-Success "✅ pnpm version: $pnpmVersion"
    }
    
    # Check Git (optional but recommended)
    if (Test-Command "git") {
        $gitVersion = (git --version) -replace 'git version ', ''
        Write-Success "✅ Git version: $gitVersion"
    } else {
        Write-Warning "⚠️  Git not found (optional but recommended)"
        Write-Info "Download from: https://git-scm.com/download/win"
    }
}

# Function to clean installation
function Clean-Installation {
    Write-Info "🧹 Cleaning previous installations..."
    
    $foldersToClean = @(
        "$PROJECT_ROOT\node_modules",
        "$PROJECT_ROOT\client\node_modules",
        "$PROJECT_ROOT\server\node_modules",
        "$PROJECT_ROOT\shared\node_modules",
        "$PROJECT_ROOT\client\build",
        "$PROJECT_ROOT\server\dist"
    )
    
    foreach ($folder in $foldersToClean) {
        if (Test-Path $folder) {
            Write-Info "Removing $folder..."
            Remove-Item $folder -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    Write-Success "✅ Cleanup completed"
}

# Function to install dependencies
function Install-Dependencies {
    Write-Info "📦 Installing dependencies..."
    
    try {
        Set-Location $PROJECT_ROOT
        
        Write-Info "Installing root dependencies..."
        pnpm install
        if ($LASTEXITCODE -ne 0) { throw "Root dependency installation failed" }
        
        Write-Info "Installing server dependencies..."
        Set-Location "$PROJECT_ROOT\server"
        pnpm install
        if ($LASTEXITCODE -ne 0) { throw "Server dependency installation failed" }
        
        Write-Info "Installing client dependencies..."
        Set-Location "$PROJECT_ROOT\client"
        pnpm install
        if ($LASTEXITCODE -ne 0) { throw "Client dependency installation failed" }
        
        Set-Location $PROJECT_ROOT
        Write-Success "✅ All dependencies installed successfully!"
        
    } catch {
        Write-Error "❌ Dependency installation failed: $_"
        exit 1
    }
}

# Function to check if ports are available
function Test-Port($port) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

# Function to find available port
function Get-AvailablePort($startPort) {
    $port = $startPort
    while (-not (Test-Port $port)) {
        $port++
        if ($port -gt ($startPort + 100)) {
            throw "Could not find available port starting from $startPort"
        }
    }
    return $port
}

# Function to build application
function Build-Application {
    Write-Info "🔨 Building application..."
    
    try {
        Set-Location $PROJECT_ROOT
        
        if ($ProductionBuild) {
            Write-Info "Building for production..."
            pnpm run build
        } else {
            Write-Info "Building for development..."
            # For development, we'll just verify the build works
            pnpm run build:client
            pnpm run build:server
        }
        
        if ($LASTEXITCODE -ne 0) { throw "Build failed" }
        Write-Success "✅ Build completed successfully!"
        
    } catch {
        Write-Error "❌ Build failed: $_"
        exit 1
    }
}

# Function to start development servers
function Start-DevelopmentServers {
    Write-Info "🚀 Starting development servers..."
    
    # Check port availability
    $clientPort = Get-AvailablePort $CLIENT_PORT
    $serverPort = Get-AvailablePort $SERVER_PORT
    
    if ($clientPort -ne $CLIENT_PORT) {
        Write-Warning "⚠️  Default client port $CLIENT_PORT is busy, using port $clientPort"
    }
    if ($serverPort -ne $SERVER_PORT) {
        Write-Warning "⚠️  Default server port $SERVER_PORT is busy, using port $serverPort"
    }
    
    Write-Success "🌐 Application will be available at:"
    Write-Success "   Client: http://localhost:$clientPort"
    Write-Success "   Server: http://localhost:$serverPort"
    Write-Info ""
    Write-Info "Press Ctrl+C to stop all servers"
    Write-Info ""
    
    try {
        Set-Location $PROJECT_ROOT
        
        # Set environment variables for custom ports if needed
        if ($clientPort -ne $CLIENT_PORT) {
            $env:PORT = $clientPort
        }
        if ($serverPort -ne $SERVER_PORT) {
            $env:SERVER_PORT = $serverPort
        }
        
        # Start both servers concurrently
        pnpm run dev
        
    } catch {
        Write-Error "❌ Failed to start development servers: $_"
        exit 1
    }
}

# Function to start production server
function Start-ProductionServer {
    Write-Info "🚀 Starting production server..."
    
    try {
        Set-Location $PROJECT_ROOT
        
        # Check if build exists
        if (-not (Test-Path "$PROJECT_ROOT\client\build") -or -not (Test-Path "$PROJECT_ROOT\server\dist")) {
            Write-Warning "⚠️  Production build not found, building now..."
            Build-Application
        }
        
        Write-Success "🌐 Production server starting..."
        Write-Info "Press Ctrl+C to stop the server"
        
        pnpm start
        
    } catch {
        Write-Error "❌ Failed to start production server: $_"
        exit 1
    }
}

# Function to show system information
function Show-SystemInfo {
    Write-Info "💻 System Information:"
    Write-Info "   OS: $([System.Environment]::OSVersion.VersionString)"
    Write-Info "   PowerShell: $($PSVersionTable.PSVersion)"
    Write-Info "   Architecture: $([System.Environment]::Is64BitOperatingSystem ? '64-bit' : '32-bit')"
    Write-Info "   Memory: $([math]::Round((Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property capacity -Sum).sum / 1gb, 2)) GB"
    Write-Info ""
}

# Main execution
try {
    Show-SystemInfo
    
    # Install prerequisites
    Install-Prerequisites
    
    # Handle clean install
    if ($CleanInstall) {
        Clean-Installation
    }
    
    # Install dependencies unless skipped
    if (-not $SkipInstall) {
        Install-Dependencies
    }
    
    # Build and run application
    if ($ProductionBuild) {
        Build-Application
        Start-ProductionServer
    } else {
        Start-DevelopmentServers
    }
    
} catch {
    Write-Error "❌ Script execution failed: $_"
    Write-Info "For help, run: .\run-desktop-app.ps1 -Help"
    exit 1
} finally {
    # Return to original directory
    Set-Location $PROJECT_ROOT
}
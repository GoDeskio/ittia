# Create Desktop Shortcut for VoiceVault
# This script creates a desktop shortcut to easily launch the VoiceVault application

param(
    [switch]$Help
)

if ($Help) {
    Write-Host @"
VoiceVault Desktop Shortcut Creator

USAGE:
    .\create-desktop-shortcut.ps1

This script creates a desktop shortcut that will:
- Launch the VoiceVault desktop application
- Use the smart launcher (run-app.bat)
- Work from any location

The shortcut will be created on your desktop as "VoiceVault.lnk"
"@
    exit 0
}

try {
    $projectRoot = $PSScriptRoot
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "VoiceVault.lnk"
    
    # Create WScript Shell object
    $WScriptShell = New-Object -ComObject WScript.Shell
    
    # Create shortcut
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = Join-Path $projectRoot "run-app.bat"
    $shortcut.WorkingDirectory = $projectRoot
    $shortcut.Description = "VoiceVault Desktop Application - Advanced voice recognition and management system"
    $shortcut.IconLocation = "shell32.dll,25"  # Microphone icon
    
    # Save shortcut
    $shortcut.Save()
    
    Write-Host "✅ Desktop shortcut created successfully!" -ForegroundColor Green
    Write-Host "📍 Location: $shortcutPath" -ForegroundColor Cyan
    Write-Host "🚀 Double-click the shortcut to launch VoiceVault" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Failed to create desktop shortcut: $_" -ForegroundColor Red
    Write-Host "You can manually create a shortcut to: $projectRoot\run-app.bat" -ForegroundColor Yellow
}